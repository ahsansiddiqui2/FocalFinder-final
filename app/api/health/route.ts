import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Health check endpoint called")

    return new NextResponse(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "API is working",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("[v0] Health check error:", error)

    return new NextResponse(
      JSON.stringify({
        error: "Health check failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
