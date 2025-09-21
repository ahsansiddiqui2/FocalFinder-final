import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/bookings - Starting simplified request")

    const mockBookings = [
      {
        id: "1",
        client_id: "test-user",
        photographer_id: "1",
        event_date: "2024-06-15",
        event_time: "14:00",
        duration: 6,
        location: "Golden Gate Park, San Francisco",
        event_type: "Wedding",
        total_amount: 1200,
        status: "confirmed",
        created_at: "2024-01-15T00:00:00Z",
        photographer_first_name: "Sarah",
        photographer_last_name: "Chen",
        photographer_image: "/professional-photographer-woman-portrait.png",
      },
      {
        id: "2",
        client_id: "test-user",
        photographer_id: "2",
        event_date: "2024-07-20",
        event_time: "10:00",
        duration: 4,
        location: "Central Park, New York",
        event_type: "Portrait Session",
        total_amount: 800,
        status: "pending",
        created_at: "2024-01-20T00:00:00Z",
        photographer_first_name: "Marcus",
        photographer_last_name: "Rodriguez",
        photographer_image: "/professional-photographer-man-portrait.png",
      },
    ]

    console.log("[v0] Returning", mockBookings.length, "bookings")

    return new NextResponse(JSON.stringify({ bookings: mockBookings }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("[v0] GET /api/bookings error:", error)

    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/bookings - Starting simplified request")

    const body = await request.json()
    console.log("[v0] Request body received:", body)

    const newBooking = {
      id: Date.now().toString(),
      client_id: "test-user",
      ...body,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("[v0] Booking created successfully:", newBooking.id)

    return new NextResponse(
      JSON.stringify({
        booking: newBooking,
        message: "Booking request sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("[v0] POST /api/bookings error:", error)

    return new NextResponse(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
