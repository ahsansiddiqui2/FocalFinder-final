import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
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

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    let payload: any
    try { payload = verifyJwt(token) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const userId = payload.userId
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { include: { photographerProfile: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    })

    const list = conversations.map((c) => {
      const other = c.participants.find((p: any) => p.userId !== userId) ?? c.participants[0]
      const otherUser = other?.user
      const lastMsg = c.messages?.[0]
      return {
        id: c.id,
        participantId: otherUser?.id ?? null,
        participantName: otherUser ? `${otherUser.firstName} ${otherUser.lastName}`.trim() : "Unknown",
        participantImage:
          (otherUser as any)?.photographerProfile?.profileImageUrl ??
          (otherUser as any)?.profileImageUrl ??
          "/placeholder.svg",
        participantRole: (otherUser?.role?.toLowerCase?.() as any) ?? "client",
        lastMessage: lastMsg?.text ?? "",
        lastMessageTime: lastMsg?.createdAt?.toISOString?.() ?? c.updatedAt?.toISOString?.() ?? new Date().toISOString(),
        unreadCount: 0,
        bookingId: c.bookingId ?? null,
        eventType: c.booking?.brief?.title ?? null,
      }
    })

    return NextResponse.json({ conversations: list })
  } catch (err: any) {
    console.error("GET /api/conversations error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}

// create or return existing conversation between current user and participantId (optional bookingId)
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    let payload: any
    try { payload = verifyJwt(token) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const body = await request.json()
    const participantId: string = body.participantId
    const bookingId: string | undefined = body.bookingId

    if (!participantId) return NextResponse.json({ error: "participantId required" }, { status: 400 })
    if (participantId === payload.userId) return NextResponse.json({ error: "Cannot start conversation with yourself" }, { status: 400 })

    // If bookingId provided, prefer conversation linked to booking
    if (bookingId) {
      const existingByBooking = await prisma.conversation.findUnique({
        where: { bookingId },
        include: { participants: { include: { user: { include: { photographerProfile: true } } } } },
      })
      if (existingByBooking) return NextResponse.json({ conversation: existingByBooking })
    }

    // find conversation that already contains both participants
    const existing = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: payload.userId } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: { participants: { include: { user: { include: { photographerProfile: true } } } }, messages: { take: 1, orderBy: { createdAt: "desc" } } },
    })
    if (existing) return NextResponse.json({ conversation: existing })

    // create conversation and participants
    const conv = await prisma.conversation.create({
      data: {
        bookingId: bookingId ?? null,
        participants: {
          create: [
            { user: { connect: { id: payload.userId } } },
            { user: { connect: { id: participantId } } },
          ],
        },
      },
      include: { participants: { include: { user: { include: { photographerProfile: true } } } } },
    })

    // if booking provided, link conversation id to booking
    if (bookingId) {
      await prisma.booking.update({ where: { id: bookingId }, data: { conversation: { connect: { id: conv.id } } } })
      await prisma.conversation.update({ where: { id: conv.id }, data: { bookingId } })
    }

    return NextResponse.json({ conversation: conv }, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/conversations error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
