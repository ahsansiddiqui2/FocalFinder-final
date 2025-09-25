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

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ensure photographer
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
    if (!user || user.role !== "PHOTOGRAPHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get("file") as any
    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // ensure profile exists
    let profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile) {
      profile = await prisma.photographerProfile.create({ data: { userId: payload.userId } })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "photographers", payload.userId)
    await fs.mkdir(uploadsDir, { recursive: true })

    const originalName = file.name ?? `avatar-${Date.now()}`
    const safeName = `avatar-${Date.now()}-${originalName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_.]/g, "")}`
    const filePath = path.join(uploadsDir, safeName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)

    const publicUrl = `/uploads/photographers/${payload.userId}/${safeName}`

    // delete old file if exists
    if (profile.profileImageUrl && profile.profileImageUrl.startsWith("/uploads/")) {
      try {
        const oldDisk = path.join(process.cwd(), "public", profile.profileImageUrl.replace(/^\/+/, ""))
        await fs.unlink(oldDisk)
      } catch (e) {
        // ignore
      }
    }

    const updated = await prisma.photographerProfile.update({
      where: { userId: payload.userId },
      data: { profileImageUrl: publicUrl, profileImagePublicId: safeName },
    })

    return NextResponse.json({ profile: updated }, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/photographer/profile/avatar error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromReq(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    let payload: any
    try {
      payload = verifyJwt(token)
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.photographerProfile.findUnique({ where: { userId: payload.userId } })
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 })

    // delete file from disk if under public/uploads
    if (profile.profileImageUrl && profile.profileImageUrl.startsWith("/uploads/")) {
      const diskPath = path.join(process.cwd(), "public", profile.profileImageUrl.replace(/^\/+/, ""))
      try {
        await fs.unlink(diskPath)
      } catch (e) {
        // ignore
      }
    }

    const updated = await prisma.photographerProfile.update({
      where: { userId: payload.userId },
      data: { profileImageUrl: null, profileImagePublicId: null },
    })

    return NextResponse.json({ profile: updated })
  } catch (err: any) {
    console.error("DELETE /api/photographer/profile/avatar error:", err)
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 })
  }
}