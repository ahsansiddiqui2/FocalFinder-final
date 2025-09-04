import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["client", "photographer"], { required_error: "Role is required" }),
  specialty: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, role, specialty } = signupSchema.parse(body)

    // TODO: Check if user already exists
    // const existingUser = await getUserByEmail(email)
    // if (existingUser) {
    //   return NextResponse.json({ error: "User already exists" }, { status: 409 })
    // }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // TODO: Create user in database
    const newUser = {
      id: Date.now().toString(), // Mock ID generation
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      specialty: role === "photographer" ? specialty : undefined,
      createdAt: new Date().toISOString(),
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "7d" },
    )

    // Create response with user data (excluding password)
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        specialty: newUser.specialty,
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

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
