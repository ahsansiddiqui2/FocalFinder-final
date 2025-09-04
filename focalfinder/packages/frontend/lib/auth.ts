import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "client" | "photographer" | "admin"
}

export async function verifyAuth(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // TODO: Get user from database and verify they still exist
    return {
      id: decoded.userId,
      email: decoded.email,
      firstName: "John", // This would come from database
      lastName: "Doe",
      role: decoded.role,
    }
  } catch (error) {
    console.error("Auth verification error:", error)
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: User) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await verifyAuth(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(request, user)
  }
}

export function requireRole(roles: string[]) {
  return (handler: (request: NextRequest, user: User) => Promise<Response>) => async (request: NextRequest) => {
    const user = await verifyAuth(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!roles.includes(user.role)) {
      return new Response(JSON.stringify({ error: "Insufficient permissions" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return handler(request, user)
  }
}
