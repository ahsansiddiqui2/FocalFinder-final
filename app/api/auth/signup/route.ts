import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../lib/prisma"
import type { Prisma } from "@prisma/client"

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

    // check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // map incoming role to Prisma enum value
    const prismaRole = role === "photographer" ? "PHOTOGRAPHER" : "CLIENT"

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: prismaRole as Prisma.EnumRole, // cast for TS
        specialty: role === "photographer" ? specialty ?? null : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        specialty: true,
      },
    })

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET not set")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    const token = jwt.sign({ userId: newUser.id, email: newUser.email, role: newUser.role }, jwtSecret, {
      expiresIn: "7d",
    })

    const response = NextResponse.json({ user: newUser, token }, { status: 201 })
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    // Prisma unique constraint error handling
    if ((error as any)?.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
