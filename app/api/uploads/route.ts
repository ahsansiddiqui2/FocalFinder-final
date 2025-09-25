import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const files: { name: string; data: string }[] = body?.files ?? []
    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    const saved: { name: string; url: string }[] = []

    for (const f of files) {
      const nameSafe = (f.name || "file").replace(/[^a-zA-Z0-9\-_\.]/g, "-").slice(0, 200)
      // accept data URL (data:*/*;base64,...) or raw base64
      const dataPart = f.data.includes(",") ? f.data.split(",").pop()! : f.data
      const buffer = Buffer.from(dataPart, "base64")
      const filename = `${Date.now()}-${nameSafe}`
      const filepath = path.join(uploadsDir, filename)
      fs.writeFileSync(filepath, buffer)
      saved.push({ name: f.name, url: `/uploads/${filename}` })
    }

    return NextResponse.json({ files: saved })
  } catch (err: any) {
    console.error("POST /api/uploads error:", err)
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 })
  }
}