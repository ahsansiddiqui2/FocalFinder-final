import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const sendMessageSchema = z.object({
  recipientId: z.string(),
  content: z.string().min(1),
  messageType: z.enum(["text", "image", "file"]).default("text"),
  attachments: z.array(z.string()).optional(),
})

// Mock messages data
const mockMessages = [
  {
    id: "1",
    senderId: "user-1",
    recipientId: "photographer-1",
    content: "Hi! I'm interested in your wedding photography services.",
    timestamp: "2024-03-15T09:00:00Z",
    isRead: true,
    messageType: "text",
  },
  {
    id: "2",
    senderId: "photographer-1",
    recipientId: "user-1",
    content: "Thank you for your interest! I'd love to discuss your needs.",
    timestamp: "2024-03-15T09:15:00Z",
    isRead: false,
    messageType: "text",
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const participantId = searchParams.get("participantId")

    // TODO: Get messages from database
    // For now, return mock data
    return NextResponse.json({
      messages: mockMessages,
      success: true,
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { recipientId, content, messageType, attachments } = sendMessageSchema.parse(body)

    // TODO: Authenticate user and get sender ID
    const senderId = "current-user-id" // This should come from authentication

    // TODO: Save message to database
    const newMessage = {
      id: Date.now().toString(),
      senderId,
      recipientId,
      content,
      messageType,
      attachments: attachments || [],
      timestamp: new Date().toISOString(),
      isRead: false,
    }

    console.log("Saving message:", newMessage)

    return NextResponse.json({
      message: newMessage,
      success: true,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    console.error("Send message error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
