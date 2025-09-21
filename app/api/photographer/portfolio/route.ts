import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { prisma } from "../../../../lib/prisma"

export const runtime = "nodejs"

const uploadSchema = z.object({
  category: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
})

function getTokenFromReq(req: NextRequest) {
  return req.cookies.get("auth-token")?.value
}

function verifyJwt(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET not set")
  return jwt.verify(token, secret) as any
}

export async function GET(request: NextRequest) {
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
    if (!profile) return NextResponse.json({ items: [] })

    const items = await prisma.portfolioItem.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ items })
  } catch (err) {
    console.error("GET /api/photographer/portfolio error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
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

    // Only photographers
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { role: true } })
    if (!user || user.role !== "PHOTOGRAPHER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get("file") as any
    const category = form.get("category")?.toString() ?? null
    const isFeaturedRaw = form.get("isFeatured")
    const isFeatured = String(isFeaturedRaw) === "true"

    uploadSchema.parse({ category, isFeatured })

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

    const originalName = file.name ?? `upload-${Date.now()}`
    const safeName = `${Date.now()}-${originalName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-_.]/g, "")}`
    const filePath = path.join(uploadsDir, safeName)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer, "binary")

    const publicUrl = `/uploads/photographers/${payload.userId}/${safeName}`

    const newItem = await prisma.portfolioItem.create({
      data: {
        profileId: profile.id,
        url: publicUrl,
        caption: form.get("caption")?.toString() ?? null,
        isFeatured: Boolean(isFeatured),
        category: category ?? null,
      },
    })

    return NextResponse.json({ item: newItem }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors?.[0]?.message || "Invalid payload" }, { status: 400 })
    }
    console.error("POST /api/photographer/portfolio error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}