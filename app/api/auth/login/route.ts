import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../lib/prisma"

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

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
      },
    })

    if (!user) {
      console.log("[v0] User not found")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      console.log("[v0] Invalid password")
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET not set")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, jwtSecret, {
      expiresIn: "7d",
    })

    const { password: _p, ...publicUser } = user

    const response = NextResponse.json({ user: publicUser, token })
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    console.log("[v0] Login successful, returning user data")
    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[v0] Validation error:", error.errors)
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
