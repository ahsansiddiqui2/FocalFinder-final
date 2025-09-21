import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../lib/prisma"

export const runtime = "nodejs"

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  duration_hours: z.number().int().nullable().optional(),
  features: z.array(z.string()).nullable().optional(),
  is_active: z.boolean().optional(),
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
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile) return NextResponse.json({ items: [] })

    const items = await prisma.servicePackage.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ items })
  } catch (err) {
    console.error("GET /api/photographer/packages error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ensure user is a photographer
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
    if (!user || user.role !== "PHOTOGRAPHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const body = await request.json()
    const data = createSchema.parse(body)

    // ensure profile exists
    let profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile) {
      profile = await prisma.photographerProfile.create({ data: { userId: payload.userId } })
    }

    const item = await prisma.servicePackage.create({
      data: {
        profileId: profile.id,
        name: data.name,
        description: data.description ?? null,
        price: data.price ?? null,
        duration_hours: data.duration_hours ?? null,
        features: data.features ?? undefined,
        is_active: data.is_active ?? true,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "Invalid payload" }, { status: 400 })
    }
    console.error("POST /api/photographer/packages error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}