"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Search, MessageCircle, Camera, Loader2 } from "lucide-react"

interface Conversation {
  id: string
  participantId: string
  participantName: string
  participantImage: string
  participantRole: "client" | "photographer"
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  isOnline: boolean
  bookingId?: string
  eventType?: string
}

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      loadConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  const loadConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/conversations", { credentials: "include" })
      const json = await res.json()
      if (res.ok && Array.isArray(json.conversations)) {
        setConversations(
          json.conversations.map((c: any) => ({
            id: c.id,
            participantId: c.participantId,
            participantName: c.participantName,
            participantImage: c.participantImage,
            participantRole: c.participantRole,
            lastMessage: c.lastMessage,
            lastMessageTime: c.lastMessageTime,
            unreadCount: c.unreadCount ?? 0,
            isOnline: false, // add real presence later
            bookingId: c.bookingId,
            eventType: c.eventType,
          })),
        )
      } else {
        console.error("Failed to load conversations:", json)
        setConversations([])
      }
    } catch (err) {
      console.error("Failed to load conversations:", err)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.eventType?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Messages</h1>
          <p className="text-muted-foreground">
            {user.role === "client"
              ? "Communicate with photographers about your bookings and projects"
              : "Chat with clients about their photography needs and bookings"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <div className="space-y-0">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => router.push(`/messages/${conversation.id}`)}
                        className="w-full p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={conversation.participantImage || "/placeholder.svg"}
                                alt={conversation.participantName}
                              />
                              <AvatarFallback>
                                {conversation.participantName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-sm truncate">{conversation.participantName}</h3>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(conversation.lastMessageTime)}
                                </span>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-primary text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {conversation.eventType && (
                              <div className="flex items-center gap-1 mb-1">
                                <Camera className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{conversation.eventType}</span>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <Button asChild className="mt-4 bg-transparent" variant="outline">
                      <a href="/search">Find Photographers</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Empty State for Chat */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
