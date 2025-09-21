import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../../lib/prisma"

export const runtime = "nodejs"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = updateSchema.parse(body)

    const existing = await prisma.servicePackage.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile || profile.id !== existing.profileId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const updated = await prisma.servicePackage.update({
      where: { id: params.id },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        price: data.price ?? undefined,
        duration_hours: data.duration_hours ?? undefined,
        features: data.features ?? undefined,
        is_active: data.is_active ?? undefined,
      },
    })

    return NextResponse.json({ item: updated })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "Invalid payload" }, { status: 400 })
    }
    console.error("PUT /api/photographer/packages/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existing = await prisma.servicePackage.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile || profile.id !== existing.profileId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.servicePackage.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/photographer/packages/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}