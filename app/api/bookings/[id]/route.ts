import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../lib/prisma"

export const runtime = "nodejs"

function getTokenFromReq(req: NextRequest) {
  return req.cookies.get("auth-token")?.value
}
function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET not set")
  return jwt.verify(token, secret) as any
}

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "DECLINED"]).optional(),
  price: z.number().optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { photographer: true, client: true, brief: true },
    })
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // only participants or admins can view
    if (booking.clientId !== payload.userId && booking.photographerId !== payload.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json({ booking })
  } catch (err: any) {
    console.error("GET /api/bookings/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
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

    const existing = await prisma.booking.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // photographer can confirm/complete/decline; client can cancel
    const userId = payload.userId
    const isPhotog = existing.photographerId === userId
    const isClient = existing.clientId === userId

    if (!isPhotog && !isClient) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const allowedUpdates: any = {}
    if (data.status) {
      if (data.status === "CONFIRMED" || data.status === "COMPLETED" || data.status === "DECLINED") {
        if (!isPhotog) return NextResponse.json({ error: "Only photographer can set this status" }, { status: 403 })
        allowedUpdates.status = data.status
      } else if (data.status === "CANCELLED") {
        // both sides may cancel
        allowedUpdates.status = "CANCELLED"
      } else if (data.status === "PENDING") {
        // no-op or allow resetting if photog
        if (!isPhotog) return NextResponse.json({ error: "Only photographer can set this status" }, { status: 403 })
        allowedUpdates.status = "PENDING"
      }
    }
    if (typeof data.price === "number") allowedUpdates.price = data.price

    const updated = await prisma.booking.update({ where: { id: params.id }, data: allowedUpdates })
    return NextResponse.json({ booking: updated })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors?.[0]?.message ?? "Invalid payload" }, { status: 400 })
    }
    console.error("PUT /api/bookings/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
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

    const existing = await prisma.booking.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const userId = payload.userId
    const isPhotog = existing.photographerId === userId
    const isClient = existing.clientId === userId

    // allow deletion by client (before confirmed) or photographer/admin
    if (!(isClient || isPhotog)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    await prisma.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("DELETE /api/bookings/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}