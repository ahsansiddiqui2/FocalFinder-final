import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import jwt from "jsonwebtoken"
import { prisma } from "../../../../../lib/prisma"

export const runtime = "nodejs"

function getTokenFromReq(req: NextRequest) {
  return req.cookies.get("auth-token")?.value
}

function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET not set")
  return jwt.verify(token, secret) as any
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const item = await prisma.portfolioItem.findUnique({ where: { id: params.id } })
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile || profile.id !== item.profileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // delete file from disk (if under public/uploads)
    if (item.url && item.url.startsWith("/uploads/")) {
      const diskPath = path.join(process.cwd(), "public", item.url.replace(/^\/+/, ""))
      try {
        await fs.unlink(diskPath)
      } catch (e) {
        // ignore if already removed
      }
    }

    await prisma.portfolioItem.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/photographer/portfolio/[id] error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}