import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const photographerId = url.searchParams.get("photographerId")
    if (!photographerId) return NextResponse.json({ canReview: false })

    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ canReview: false }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ canReview: false }, { status: 401 })
    }

    // find a past booking for this client with the photographer that doesn't have a review yet
    const booking = await prisma.booking.findFirst({
      where: {
        photographerId,
        clientId: payload.userId,
        NOT: { status: "CANCELLED" },
        startAt: { lt: new Date() }, // only past sessions
      },
      orderBy: { startAt: "desc" },
    })

    if (!booking) return NextResponse.json({ canReview: false })

    const existing = await prisma.review.findFirst({ where: { bookingId: booking.id } })
    if (existing) return NextResponse.json({ canReview: false })

    return NextResponse.json({ canReview: true, bookingId: booking.id })
  } catch (err: any) {
    console.error("GET /api/reviews/can-review error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}