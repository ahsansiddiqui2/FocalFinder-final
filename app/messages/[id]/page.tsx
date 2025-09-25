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
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    // scroll chat container to bottom whenever messages change
    // use requestAnimationFrame to ensure layout is ready
    requestAnimationFrame(() => {
      const c = messagesContainerRef.current
      if (c) {
        c.scrollTop = c.scrollHeight
      } else {
        // fallback to element-based scroll if container not available
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    })
  }, [messages])

  const scrollToBottom = () => {
    const c = messagesContainerRef.current
    if (c) {
      c.scrollTop = c.scrollHeight
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  const loadConversation = async (conversationId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}`, { credentials: "include" })
      const json = await res.json()
      if (!res.ok) {
        console.error("Failed to load conversation:", json)
        setParticipant(null)
        setMessages([])
        return
      }
      const conv = json.conversation
      setParticipant(conv.participant)
      setMessages(
        (conv.messages || []).map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          recipientId: conv.participant?.id === m.senderId ? (user?.id || "") : conv.participant?.id || "",
          content: m.content,
          timestamp: m.timestamp,
          isRead: false,
          messageType: "text",
        })),
      )
    } catch (err) {
      console.error("Failed to load conversation:", err)
      setParticipant(null)
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  // new helper to upload files (reads File -> base64 -> POST /api/uploads)
  const uploadFiles = async (files: File[]) => {
    if (!files || files.length === 0) return []
    const payloadFiles: { name: string; data: string }[] = []

    for (const f of files) {
      const dataUrl: string = await new Promise((res, rej) => {
        const reader = new FileReader()
        reader.onload = () => res(String(reader.result))
        reader.onerror = () => rej("Failed reading file")
        reader.readAsDataURL(f)
      })
      payloadFiles.push({ name: f.name, data: dataUrl })
    }

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: payloadFiles }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error("Upload failed:", json)
        return []
      }
      return (json.files || []).map((f: any) => f.url)
    } catch (err) {
      console.error("Upload error:", err)
      return []
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fList = e.target.files ? Array.from(e.target.files) : []
    if (fList.length === 0) return
    setSending(true)
    try {
      const urls = await uploadFiles(fList)
      if (urls.length === 0) {
        setSending(false)
        return
      }

      // send message with attachments (no text)
      if (!params?.id) return
      const res = await fetch(`/api/conversations/${encodeURIComponent(params.id as string)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "", attachments: urls }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error("Send attachment failed:", json)
        return
      }
      const m = json.message
      setMessages((prev) => [
        ...prev,
        {
          id: m.id,
          senderId: m.senderId,
          recipientId: participant?.id || "",
          content: m.text || "",
          timestamp: m.createdAt ?? new Date().toISOString(),
          isRead: false,
          messageType: "text",
          attachments: m.attachments ?? [],
        },
      ])
      // ensure we scroll
      scrollToBottom()
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
      // reset file input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  // update Send handler to support attachments in messages and to preserve attachments rendering
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !false) || sending || !user) return
    if (!params?.id) return

    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(params.id as string)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMessage.trim(), attachments: [] }),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error("Send message failed:", json)
        return
      }
      const m = json.message
      setMessages((prev) => [
        ...prev,
        {
          id: m.id,
          senderId: m.senderId,
          recipientId: participant?.id || "",
          content: m.text,
          timestamp: m.createdAt ?? new Date().toISOString(),
          isRead: false,
          messageType: "text",
          attachments: m.attachments ?? [],
        },
      ])
      setNewMessage("")
      scrollToBottom()
    } catch (err) {
      console.error("Failed to send message:", err)
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
              </div>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === user.id
              return (
                <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                    <div
                      className={`rounded-2xl px-4 py-2 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      <p className="text-sm">{message.content}</p>

                      {/* attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {message.attachments.map((att, i) => (
                            <a key={i} href={att} target="_blank" rel="noreferrer" className="block">
                              <img src={att} alt={`attachment-${i}`} className="w-full h-24 object-cover rounded" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${isOwn ? "justify-end" : "justify-start"}`}>
                      <Clock className="w-3 h-3" />
                      <span>{formatMessageTime(message.timestamp)}</span>
                      {isOwn && (
                        <div className="ml-1">{message.isRead ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3" />}</div>
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
              <input ref={fileInputRef} type="file" multiple onChange={handleFileInputChange} className="hidden" />
              <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={sending}>
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
