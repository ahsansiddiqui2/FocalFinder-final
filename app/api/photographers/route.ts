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

    // base filter: only photographers
    const where: any = { role: "PHOTOGRAPHER" }
    const and: any[] = []

    // keep existing filters
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

    // fuzzy global search across multiple fields (main search box)
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
            // portfolio captions/categories
            { photographerProfile: { is: { portfolio: { some: { caption: { contains: s } } } } } },
            { photographerProfile: { is: { portfolio: { some: { category: { contains: s } } } } } },
          ],
        })
      }
    }

    if (and.length) where.AND = and

    // count + page
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

    const photographers = users.map((u) => {
      const profile = u.photographerProfile as any
      const firstImage = profile?.portfolio?.[0]?.url || null
      return {
        id: u.id,
        first_name: u.firstName,
        last_name: u.lastName,
        specialty: profile?.specialty ?? u.specialty ?? null,
        location: profile?.location ?? null,
        hourly_rate: profile?.hourlyRate ?? null,
        rating_average: 0,
        rating_count: 0,
        profile_image_url: firstImage ?? "/placeholder.svg",
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
