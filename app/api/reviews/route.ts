import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../lib/prisma"

export const runtime = "nodejs"

function getTokenFromReq(req: NextRequest) {
  return req.cookies.get("auth-token")?.value
}
function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET not set")
  return jwt.verify(token, secret) as any
}

const createSchema = z.object({
  bookingId: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
})

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

    const body = await request.json()
    const data = createSchema.parse(body)

    // validate booking exists and belongs to the user, and is in the past / not cancelled
    const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } })
    if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    if (booking.clientId !== payload.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    if (booking.status === "CANCELLED") return NextResponse.json({ error: "Cannot review cancelled booking" }, { status: 400 })
    if (new Date(booking.startAt) > new Date()) return NextResponse.json({ error: "Cannot review future booking" }, { status: 400 })

    // ensure no existing review for this booking
    const exists = await prisma.review.findFirst({ where: { bookingId: booking.id } })
    if (exists) return NextResponse.json({ error: "Booking already reviewed" }, { status: 409 })

    // create review
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        reviewerId: payload.userId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
      include: { reviewer: true },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors?.[0]?.message ?? "Invalid payload" }, { status: 400 })
    }
    console.error("POST /api/reviews error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}