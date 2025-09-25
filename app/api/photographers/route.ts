import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams

    const page = Math.max(1, parseInt(q.get("page") || "1"))
    const limit = Math.max(1, Math.min(100, parseInt(q.get("limit") || "12")))
    const search = q.get("q") || undefined
    const specialty = q.get("specialty") || undefined
    const location = q.get("location") || undefined
    const minPrice = q.get("minPrice")
    const maxPrice = q.get("maxPrice")

    // build filters
    const where: any = { role: "PHOTOGRAPHER" }
    const and: any[] = []

    if (specialty) {
      and.push({
        OR: [
          { specialty: { contains: specialty } },
          { photographerProfile: { is: { specialty: { contains: specialty } } } },
        ],
      })
    }

    if (location) {
      and.push({ photographerProfile: { is: { location: { contains: location } } } })
    }

    if (minPrice || maxPrice) {
      const priceFilter: any = {}
      if (minPrice) priceFilter.gte = Number(minPrice)
      if (maxPrice) priceFilter.lte = Number(maxPrice)
      and.push({ photographerProfile: { is: { hourlyRate: priceFilter } } })
    }

    if (search) {
      const s = search.trim()
      if (s.length) {
        and.push({
          OR: [
            { firstName: { contains: s } },
            { lastName: { contains: s } },
            { email: { contains: s } },
            { specialty: { contains: s } },
            { photographerProfile: { is: { specialty: { contains: s } } } },
            { photographerProfile: { is: { bio: { contains: s } } } },
            { photographerProfile: { is: { location: { contains: s } } } },
            { photographerProfile: { is: { portfolio: { some: { caption: { contains: s } } } } } },
            { photographerProfile: { is: { portfolio: { some: { category: { contains: s } } } } } },
          ],
        })
      }
    }

    if (and.length) where.AND = and

    const total = await prisma.user.count({ where })

    const users = await prisma.user.findMany({
      where,
      include: {
        photographerProfile: {
          include: {
            portfolio: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    // aggregate reviews for the returned photographers
    const userIds = users.map((u) => u.id)
    const reviewMap = new Map<string, { sum: number; count: number }>()
    if (userIds.length) {
      const reviews = await prisma.review.findMany({
        where: { booking: { is: { photographerId: { in: userIds } } } },
        select: { rating: true, booking: { select: { photographerId: true } } },
      })
      reviews.forEach((r) => {
        const pid = r.booking.photographerId
        const cur = reviewMap.get(pid) ?? { sum: 0, count: 0 }
        cur.sum += r.rating
        cur.count += 1
        reviewMap.set(pid, cur)
      })
    }

    const photographers = users.map((u) => {
      const profile = u.photographerProfile as any
      const portfolioFirst = profile?.portfolio?.[0]?.url ?? null
      const avatar = profile?.profileImageUrl ?? null

      const agg = reviewMap.get(u.id) ?? { sum: 0, count: 0 }
      const rating_average = agg.count ? Number((agg.sum / agg.count).toFixed(1)) : 0
      const rating_count = agg.count

      return {
        id: u.id,
        first_name: u.firstName,
        last_name: u.lastName,
        specialty: profile?.specialty ?? u.specialty ?? null,
        location: profile?.location ?? null,
        hourly_rate: profile?.hourlyRate ?? null,
        rating_average,
        rating_count,
        profile_image_url: avatar ?? "/placeholder.svg",
        cover_image_url: portfolioFirst ?? "/placeholder.svg",
        is_available: true,
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      photographers,
      pagination: { page, limit, total, totalPages },
    })
  } catch (err: any) {
    console.error("GET /api/photographers error:", err)
    const payload: any = { error: err?.message || "Internal server error" }
    if (process.env.NODE_ENV !== "production") payload.stack = err?.stack
    return NextResponse.json(payload, { status: 500 })
  }
}
