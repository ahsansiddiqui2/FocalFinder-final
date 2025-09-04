import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Auth/me endpoint called - simplified version")

    const mockUser = {
      id: "1",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      role: "client",
    }

    console.log("[v0] Returning mock user data:", mockUser)
    return NextResponse.json({
      user: mockUser,
    })
  } catch (error) {
    console.error("[v0] Auth verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
