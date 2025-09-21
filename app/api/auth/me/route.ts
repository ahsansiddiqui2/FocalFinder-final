import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "../../../../lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) return NextResponse.json({ user: null }, { status: 200 })

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error("JWT_SECRET not set")
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
    }

    let payload: any
    try {
      payload = jwt.verify(token, jwtSecret)
    } catch (err) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, specialty: true },
    })

    return NextResponse.json({ user: user ?? null }, { status: 200 })
  } catch (error) {
    console.error("Auth/me error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
