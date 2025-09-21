import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../lib/prisma"
// Decimal from Prisma removed — use plain number for hourlyRate

const profileSchema = z.object({
  bio: z.string().nullable().optional(),
  specialty: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  hourlyRate: z.union([z.string(), z.number()]).nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  styles: z.any().nullable().optional(),

  // new fields accepted from client
  yearsExperience: z.number().int().nullable().optional(),
  equipment: z.string().nullable().optional(),
  travelDistance: z.string().nullable().optional(),
})

function getTokenFromReq(req: NextRequest) {
  return req.cookies.get("auth-token")?.value
}

function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET not set")
  return jwt.verify(token, secret) as any
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ profile: null, user: null })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ profile: null, user: null })
    }

    // return user + profile
    const [user, profile] = await Promise.all([
      prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, specialty: true },
      }),
      prisma.photographerProfile.findUnique({
        where: { userId: payload.userId },
      }),
    ])

    return NextResponse.json({ user, profile })
  } catch (err) {
    console.error("GET /api/photographer/profile error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // only photographers may update this endpoint
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
    if (!user || user.role !== "PHOTOGRAPHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0] PUT /api/photographer/profile payload:", body)
    const data = profileSchema.parse(body)

    // update user's specialty on User table if provided
    if (typeof data.specialty === "string") {
      await prisma.user.update({ where: { id: payload.userId }, data: { specialty: data.specialty } })
    }

    // convert hourlyRate to a plain number (or null)
    const hourlyRateNumber =
      data.hourlyRate != null && data.hourlyRate !== "" ? Number(data.hourlyRate) : null

    const profile = await prisma.photographerProfile.upsert({
      where: { userId: payload.userId },
      update: {
        bio: data.bio ?? undefined,
        specialty: data.specialty ?? undefined,
        location: data.location ?? undefined,
        latitude: data.latitude ?? undefined,
        longitude: data.longitude ?? undefined,
        styles: data.styles ?? undefined,
        hourlyRate: hourlyRateNumber ?? undefined,
        yearsExperience: data.yearsExperience ?? undefined,
        equipment: data.equipment ?? undefined,
        travelDistance: data.travelDistance ?? undefined,
      },
      create: {
        userId: payload.userId,
        bio: data.bio ?? null,
        specialty: data.specialty ?? null,
        location: data.location ?? null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        styles: data.styles ?? null,
        hourlyRate: hourlyRateNumber ?? null,
        yearsExperience: data.yearsExperience ?? null,
        equipment: data.equipment ?? null,
        travelDistance: data.travelDistance ?? null,
      },
    })

    return NextResponse.json({ profile })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "Invalid payload" }, { status: 400 })
    }
    console.error("PUT /api/photographer/profile error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}