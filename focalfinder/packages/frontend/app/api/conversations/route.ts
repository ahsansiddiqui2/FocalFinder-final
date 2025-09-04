import { type NextRequest, NextResponse } from "next/server"

// Mock conversations data
const mockConversations = [
  {
    id: "1",
    participantId: "photographer-1",
    participantName: "Sarah Chen",
    participantImage: "/professional-photographer-woman-portrait.png",
    participantRole: "photographer",
    lastMessage: "Thank you for your interest! I'd love to discuss your wedding photography needs.",
    lastMessageTime: "2024-03-15T10:30:00Z",
    unreadCount: 2,
    isOnline: true,
    bookingId: "booking-1",
    eventType: "Wedding Photography",
  },
  {
    id: "2",
    participantId: "client-1",
    participantName: "Jessica Martinez",
    participantImage: "/placeholder.svg",
    participantRole: "client",
    lastMessage: "Perfect! Looking forward to the session next week.",
    lastMessageTime: "2024-03-14T16:45:00Z",
    unreadCount: 0,
    isOnline: false,
    bookingId: "booking-2",
    eventType: "Portrait Session",
  },
]

export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from authentication
    const userId = "current-user-id"

    // TODO: Get conversations from database
    // For now, return mock data
    return NextResponse.json({
      conversations: mockConversations,
      success: true,
    })
  } catch (error) {
    console.error("Get conversations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
