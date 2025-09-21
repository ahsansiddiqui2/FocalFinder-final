import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Login endpoint called")
    const body = await request.json()
    console.log("[v0] Login request body:", { email: body.email, password: "***" })

    const { email, password } = loginSchema.parse(body)

    // TODO: Replace with actual database query
    // const user = await getUserByEmail(email)
    const mockUser = {
      id: "1",
      email: "user@example.com",
      password: "$2a$10$hashedpassword", // This would be hashed in real implementation
      firstName: "John",
      lastName: "Doe",
      role: "client",
    }

    if (!mockUser || mockUser.email !== email) {
      console.log("[v0] User not found or email mismatch")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // TODO: Replace with actual password verification
    // const isValidPassword = await bcrypt.compare(password, user.password)
    const isValidPassword = password === "password" // Mock validation
    console.log("[v0] Password valid:", isValidPassword)

    if (!isValidPassword) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback-secret-key-for-development"
    console.log("[v0] Generating JWT with secret:", jwtSecret ? "Set" : "Not set")

    // Generate JWT token
    const token = jwt.sign({ userId: mockUser.id, email: mockUser.email, role: mockUser.role }, jwtSecret, {
      expiresIn: "7d",
    })

    console.log("[v0] JWT token generated successfully")

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      },
      token,
    })

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log("[v0] Login successful, returning user data")
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[v0] Validation error:", error.errors)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
