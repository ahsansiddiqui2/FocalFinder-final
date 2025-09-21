import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const searchSchema = z.object({
  location: z.string().optional(),
  specialty: z.string().optional(),
  priceRange: z.string().optional(),
  availability: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseInt(val) : 12)),
})

// Mock photographer data
const mockPhotographers = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah@example.com",
    specialty: "Wedding Photography",
    location: "San Francisco, CA",
    latitude: 37.7749,
    longitude: -122.4194,
    hourlyRate: 150,
    rating: 4.9,
    reviewCount: 127,
    bio: "Professional wedding photographer with 8+ years of experience capturing love stories.",
    profileImage: "/professional-photographer-woman-portrait.png",
    portfolioImages: ["/wedding-photography-couple-dancing.png", "/wedding-photography-portfolio.png"],
    isAvailable: true,
    createdAt: "2023-01-15T00:00:00Z",
  },
  {
    id: "2",
    firstName: "Marcus",
    lastName: "Rodriguez",
    email: "marcus@example.com",
    specialty: "Fashion Photography",
    location: "New York, NY",
    latitude: 40.7128,
    longitude: -74.006,
    hourlyRate: 200,
    rating: 4.8,
    reviewCount: 89,
    bio: "Fashion and portrait photographer specializing in editorial and commercial work.",
    profileImage: "/professional-photographer-man-portrait.png",
    portfolioImages: ["/fashion-photography-model-portrait.png", "/fashion-photography-portfolio.png"],
    isAvailable: true,
    createdAt: "2023-02-20T00:00:00Z",
  },
  {
    id: "3",
    firstName: "Emily",
    lastName: "Johnson",
    email: "emily@example.com",
    specialty: "Event Photography",
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    hourlyRate: 120,
    rating: 5.0,
    reviewCount: 156,
    bio: "Event photographer capturing corporate gatherings, parties, and special occasions.",
    profileImage: "/professional-photographer-woman-with-camera.png",
    portfolioImages: ["/event-photography-corporate-gathering.png", "/event-photography-portfolio.png"],
    isAvailable: false,
    createdAt: "2023-03-10T00:00:00Z",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const { location, specialty, priceRange, availability, page, limit } = searchSchema.parse(params)

    // Filter photographers based on search criteria
    let filteredPhotographers = [...mockPhotographers]

    if (location) {
      filteredPhotographers = filteredPhotographers.filter((p) =>
        p.location.toLowerCase().includes(location.toLowerCase()),
      )
    }

    if (specialty) {
      filteredPhotographers = filteredPhotographers.filter((p) =>
        p.specialty.toLowerCase().includes(specialty.toLowerCase()),
      )
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number)
      filteredPhotographers = filteredPhotographers.filter((p) => {
        if (max) {
          return p.hourlyRate >= min && p.hourlyRate <= max
        }
        return p.hourlyRate >= min
      })
    }

    if (availability === "today" || availability === "week") {
      filteredPhotographers = filteredPhotographers.filter((p) => p.isAvailable)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedPhotographers = filteredPhotographers.slice(startIndex, endIndex)

    return NextResponse.json({
      photographers: paginatedPhotographers,
      pagination: {
        page,
        limit,
        total: filteredPhotographers.length,
        totalPages: Math.ceil(filteredPhotographers.length / limit),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Search photographers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
