import { NextResponse } from "next/server"

export class ApiResponse {
  static success(data: any, status = 200) {
    return NextResponse.json(data, { status })
  }

  static error(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status })
  }

  static unauthorized(message = "Authentication required") {
    return NextResponse.json({ error: message }, { status: 401 })
  }

  static forbidden(message = "Insufficient permissions") {
    return NextResponse.json({ error: message }, { status: 403 })
  }

  static notFound(message = "Resource not found") {
    return NextResponse.json({ error: message }, { status: 404 })
  }

  static serverError(message = "Internal server error") {
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
