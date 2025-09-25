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
  photographerId: z.string().uuid(),
  briefId: z.string().uuid().optional().nullable(),
  startAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid startAt" }),
  endAt: z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid endAt" }),
  price: z.number().optional().nullable(),
})

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

    // fetch bookings where user is client or photographer
    const userId = payload.userId
    const asClient = await prisma.booking.findMany({
      where: { clientId: userId },
      include: {
        photographer: true,
        client: true,
        brief: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })
    const asPhotog = await prisma.booking.findMany({
      where: { photographerId: userId },
      include: {
        photographer: true,
        client: true,
        brief: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    // merge and dedupe by id
    const map = new Map<string, any>()
    ;[...asClient, ...asPhotog].forEach((b) => map.set(b.id, b))

    const list = Array.from(map.values()).map((b: any) => ({
      id: b.id,
      event_date: b.startAt?.toISOString?.() ?? new Date(b.startAt).toISOString(),
      event_time: new Date(b.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location:
        typeof b.brief?.location === "string"
          ? b.brief.location
          : b.brief?.location ?? "",
      event_type: b.brief?.title ?? "Photography session",
      total_amount: Number(b.price ?? 0),
      status: String(b.status).toLowerCase(),
      photographer_first_name: b.photographer?.firstName ?? null,
      photographer_last_name: b.photographer?.lastName ?? null,
      photographer_image:
        // prefer photographer profile avatar if available
        (b.photographer as any)?.photographerProfile?.profileImageUrl ??
        (b.photographer as any)?.profileImageUrl ??
        null,
      client_first_name: b.client?.firstName ?? null,
      client_last_name: b.client?.lastName ?? null,
    }))

    return NextResponse.json({ bookings: list })
  } catch (err: any) {
    console.error("GET /api/bookings error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
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

    // only clients create bookings
    if (payload.role !== "CLIENT" && payload.role !== "client") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const data = createSchema.parse(body)

    // basic existence checks
    const photog = await prisma.user.findUnique({ where: { id: data.photographerId } })
    if (!photog || photog.role !== "PHOTOGRAPHER") {
      return NextResponse.json({ error: "Photographer not found" }, { status: 404 })
    }

    // optional: ensure brief exists if provided
    let brief = null
    if (data.briefId) {
      brief = await prisma.brief.findUnique({ where: { id: data.briefId } })
      if (!brief) return NextResponse.json({ error: "Brief not found" }, { status: 404 })
    }

    const requestedStart = new Date(data.startAt)
    const requestedEnd = new Date(data.endAt)

    // check for conflicting bookings
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        photographerId: data.photographerId,
        OR: [
          {
            startAt: {
              lte: requestedStart,
            },
            endAt: {
              gte: requestedStart,
            },
          },
          {
            startAt: {
              lte: requestedEnd,
            },
            endAt: {
              gte: requestedEnd,
            },
          },
          {
            startAt: {
              gte: requestedStart,
            },
            endAt: {
              lte: requestedEnd,
            },
          },
        ],
      },
    })

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: "Requested time slot conflicts with existing bookings" },
        { status: 409 }
      )
    }

    const booking = await prisma.booking.create({
      data: {
        photographerId: data.photographerId,
        clientId: payload.userId,
        briefId: data.briefId ?? null,
        startAt: requestedStart,
        endAt: requestedEnd,
        price: data.price ?? 0,
        status: "PENDING",
      },
    })

    // ensure a conversation exists for this booking between client and photographer (reuse if exists)
    let conversation = null
    try {
      // prefer conversation linked to this booking
      conversation = await prisma.conversation.findUnique({
        where: { bookingId: booking.id },
        include: { participants: { include: { user: { include: { photographerProfile: true } } } } },
      })
      if (!conversation) {
        // check if a conversation already exists between the two users
        const existing = await prisma.conversation.findFirst({
          where: {
            AND: [
              { participants: { some: { userId: booking.clientId } } },
              { participants: { some: { userId: booking.photographerId } } },
            ],
          },
          include: { participants: { include: { user: { include: { photographerProfile: true } } } } },
        })
        if (existing) {
          conversation = existing
          // link to booking if needed
          try {
            await prisma.conversation.update({ where: { id: existing.id }, data: { bookingId: booking.id } })
            await prisma.booking.update({ where: { id: booking.id }, data: { conversation: { connect: { id: existing.id } } } })
          } catch (linkErr) {
            console.warn("failed linking existing conversation to booking:", linkErr)
          }
        } else {
          conversation = await prisma.conversation.create({
            data: {
              bookingId: booking.id,
              participants: {
                create: [
                  { user: { connect: { id: booking.clientId } } },
                  { user: { connect: { id: booking.photographerId } } },
                ],
              },
            },
            include: { participants: { include: { user: { include: { photographerProfile: true } } } } },
          })
          // link conversation to booking
          await prisma.booking.update({ where: { id: booking.id }, data: { conversation: { connect: { id: conversation.id } } } })
        }
      }
    } catch (convErr) {
      console.error("Failed to ensure/create conversation for booking:", convErr)
    }

    // return booking and conversation (if any)
    return NextResponse.json({ booking, conversation }, { status: 201 })
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.errors?.[0]?.message ?? "Invalid payload" }, { status: 400 })
    }
    console.error("POST /api/bookings error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}
