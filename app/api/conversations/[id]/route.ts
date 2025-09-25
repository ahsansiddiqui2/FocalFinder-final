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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    let payload: any
    try { payload = verifyJwt(token) } catch { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

    const conv = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        participants: { include: { user: { include: { photographerProfile: true } } } },
        messages: { orderBy: { createdAt: "asc" } },
        booking: { include: { brief: true } },
      },
    })
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 })

    const isParticipant = conv.participants.some((p: any) => p.userId === payload.userId)
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const other = conv.participants.find((p: any) => p.userId !== payload.userId)
    const otherUser = other?.user

    return NextResponse.json({
      conversation: {
        id: conv.id,
        bookingId: conv.bookingId ?? null,
        participant: otherUser ? {
          id: otherUser.id,
          name: `${otherUser.firstName} ${otherUser.lastName}`.trim(),
          image: (otherUser as any)?.photographerProfile?.profileImageUrl ?? (otherUser as any)?.profileImageUrl ?? "/placeholder.svg",
          role: (otherUser.role?.toLowerCase?.() as any) ?? "client",
          specialty: (otherUser as any)?.photographerProfile?.specialty ?? null,
        } : null,
        messages: conv.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.text,
          timestamp: m.createdAt?.toISOString?.(),
        })),
      },
    })
  } catch (err: any) {
    console.error("GET /api/conversations/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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
    const text: string = body.text ?? ""
    const attachments: string[] | undefined = Array.isArray(body.attachments) ? body.attachments : undefined

    if (!text && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message text or attachments required" }, { status: 400 })
    }

    // ensure conversation exists and user is participant
    const conv = await prisma.conversation.findUnique({ where: { id: params.id }, include: { participants: true } })
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    const isParticipant = conv.participants.some((p: any) => p.userId === payload.userId)
    if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        senderId: payload.userId,
        text,
        // if your Message model uses a JSON column for attachments this will work
        // otherwise adapt to your schema (e.g., create Attachment models)
        ...(attachments ? { attachments } : {}),
      },
    })

    // don't attempt to update updatedAt if your schema doesn't have it
    // return created message with attachments
    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        createdAt: message.createdAt,
        attachments: (message as any).attachments ?? [],
      },
    }, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/conversations/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}