import { type NextRequest, NextResponse } from "next/server"

// Mock photographer data (same as above, but we'll get by ID)
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
    bio: "Professional wedding photographer with 8+ years of experience capturing love stories. I specialize in candid moments and artistic compositions that tell your unique story.",
    profileImage: "/professional-photographer-woman-portrait.png",
    portfolioImages: [
      "/wedding-photography-couple-dancing.png",
      "/wedding-photography-portfolio-1.png",
      "/wedding-photography-portfolio-2.png",
      "/wedding-photography-portfolio-3.png",
    ],
    isAvailable: true,
    packages: [
      {
        name: "Basic Package",
        price: 800,
        duration: "4 hours",
        description: "Perfect for small ceremonies and intimate gatherings",
        features: ["4 hours of coverage", "200+ edited photos", "Online gallery", "Print release"],
      },
      {
        name: "Standard Package",
        price: 1200,
        duration: "6 hours",
        description: "Ideal for most weddings and events",
        features: [
          "6 hours of coverage",
          "400+ edited photos",
          "Online gallery",
          "Print release",
          "Engagement session",
        ],
      },
      {
        name: "Premium Package",
        price: 1800,
        duration: "8 hours",
        description: "Complete wedding day coverage",
        features: [
          "8 hours of coverage",
          "600+ edited photos",
          "Online gallery",
          "Print release",
          "Engagement session",
          "Second photographer",
          "USB drive",
        ],
      },
    ],
    reviews: [
      {
        id: "1",
        clientName: "Jessica & Mike",
        rating: 5,
        comment:
          "Sarah captured our wedding day perfectly! Her attention to detail and artistic eye exceeded our expectations.",
        date: "2024-01-15",
      },
      {
        id: "2",
        clientName: "Amanda R.",
        rating: 5,
        comment: "Professional, creative, and so easy to work with. The photos are absolutely stunning!",
        date: "2024-02-20",
      },
    ],
    createdAt: "2023-01-15T00:00:00Z",
  },
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // TODO: Get photographer from database
    const photographer = mockPhotographers.find((p) => p.id === id)

    if (!photographer) {
      return NextResponse.json({ error: "Photographer not found" }, { status: 404 })
    }

    return NextResponse.json({ photographer })
  } catch (error) {
    console.error("Get photographer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
