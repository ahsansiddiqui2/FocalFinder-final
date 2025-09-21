"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import {
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  ArrowLeft,
  Camera,
  Clock,
  Check,
  CheckCheck,
  Loader2,
} from "lucide-react"

interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  timestamp: string
  isRead: boolean
  attachments?: string[]
  messageType: "text" | "image" | "file"
}

interface Participant {
  id: string
  name: string
  image: string
  role: "client" | "photographer"
  isOnline: boolean
  lastSeen?: string
  specialty?: string
  location?: string
}

export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user && params.id) {
      loadConversation(params.id as string)
    }
  }, [user, authLoading, params.id, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadConversation = async (participantId: string) => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      const mockParticipant: Participant = {
        id: participantId,
        name: "Sarah Chen",
        image: "/professional-photographer-woman-portrait.png",
        role: "photographer",
        isOnline: true,
        specialty: "Wedding Photography",
        location: "San Francisco, CA",
      }

      const mockMessages: Message[] = [
        {
          id: "1",
          senderId: participantId,
          recipientId: user?.id || "",
          content:
            "Hi! Thank you for your interest in my wedding photography services. I'd love to learn more about your special day!",
          timestamp: "2024-03-15T09:00:00Z",
          isRead: true,
          messageType: "text",
        },
        {
          id: "2",
          senderId: user?.id || "",
          recipientId: participantId,
          content:
            "Hello Sarah! We're planning our wedding for June 15th in San Francisco. We love your portfolio and would like to discuss packages.",
          timestamp: "2024-03-15T09:15:00Z",
          isRead: true,
          messageType: "text",
        },
        {
          id: "3",
          senderId: participantId,
          recipientId: user?.id || "",
          content:
            "That's wonderful! June is such a beautiful time for weddings in SF. I have availability for that date. What's your venue?",
          timestamp: "2024-03-15T09:30:00Z",
          isRead: true,
          messageType: "text",
        },
        {
          id: "4",
          senderId: user?.id || "",
          recipientId: participantId,
          content: "We're having it at the Palace of Fine Arts. The ceremony starts at 4 PM.",
          timestamp: "2024-03-15T10:00:00Z",
          isRead: false,
          messageType: "text",
        },
        {
          id: "5",
          senderId: participantId,
          recipientId: user?.id || "",
          content:
            "Perfect location! I've shot there many times. Let me send you my wedding package details and we can schedule a call to discuss everything.",
          timestamp: "2024-03-15T10:30:00Z",
          isRead: false,
          messageType: "text",
        },
      ]

      setParticipant(mockParticipant)
      setMessages(mockMessages)
    } catch (error) {
      console.error("Failed to load conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || !user || !participant) return

    setSending(true)
    try {
      const message: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        recipientId: participant.id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
        messageType: "text",
      }

      setMessages((prev) => [...prev, message])
      setNewMessage("")

      // TODO: Send message via API
      console.log("Sending message:", message)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatLastSeen = (timestamp?: string) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    )
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Conversation Not Found</h1>
          <Button onClick={() => router.push("/messages")} variant="outline">
            Back to Messages
          </Button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <Card className="h-[700px] flex flex-col">
          {/* Chat Header */}
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.push("/messages")} className="lg:hidden">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={participant.image || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">{participant.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {participant.isOnline ? (
                        <span className="text-green-600">Online</span>
                      ) : (
                        <span>Last seen {formatLastSeen(participant.lastSeen)}</span>
                      )}
                      {participant.specialty && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {participant.specialty}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user.id
              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div
                      className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isOwn && (
                        <div className="ml-1">
                          {message.isRead ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" disabled={!newMessage.trim() || sending} size="sm">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
