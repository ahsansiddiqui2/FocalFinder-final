import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // fetch user + profile + portfolio
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        photographerProfile: {
          include: {
            portfolio: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    })

    if (!user || user.role !== "PHOTOGRAPHER") {
      return NextResponse.json({ error: "Photographer not found" }, { status: 404 })
    }

    const profile = user.photographerProfile
    const profileImages = (profile?.portfolio || []).map((p) => p.url)

    // service packages
    const packages = profile
      ? await prisma.servicePackage.findMany({
          where: { profileId: profile.id },
          orderBy: { createdAt: "desc" },
        })
      : []

    // reviews for bookings that belong to this photographer
    const reviewsRaw = await prisma.review.findMany({
      where: { booking: { photographerId: id } },
      include: { reviewer: true },
      orderBy: { createdAt: "desc" },
    })

    const reviewCount = reviewsRaw.length
    const ratingAverage = reviewCount ? Number((reviewsRaw.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1)) : 0

    const photographer = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      specialty: (profile?.specialty ?? user.specialty) ?? "",
      location: profile?.location ?? null,
      hourlyRate: profile?.hourlyRate ?? null,
      rating: ratingAverage,
      reviewCount,
      bio: profile?.bio ?? "",
      profileImage: profileImages[0] ?? "/placeholder.svg",
      portfolioImages: profileImages,
      isAvailable: true,
      packages: packages.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price ?? 0,
        duration: p.duration_hours ? `${p.duration_hours} hours` : "N/A",
        description: p.description ?? "",
        features: Array.isArray(p.features) ? p.features : [],
      })),
      reviews: reviewsRaw.map((r) => ({
        id: r.id,
        clientName: r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}`.trim() : "Anonymous",
        rating: r.rating,
        comment: r.comment ?? "",
        date: r.createdAt?.toISOString() ?? new Date().toISOString(),
      })),
      createdAt: user.createdAt?.toISOString() ?? null,
    }

    return NextResponse.json({ photographer })
  } catch (error) {
    console.error("Get photographer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
