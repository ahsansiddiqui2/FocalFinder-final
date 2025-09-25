"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { Calendar, Camera, MapPin, Clock, Loader2 } from "lucide-react"

interface Booking {
  id: string
  event_date: string
  event_time: string
  location: string
  event_type: string
  total_amount: number
  status: string
  photographer_first_name?: string
  photographer_last_name?: string
  photographer_image?: string
  client_first_name?: string
  client_last_name?: string
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchBookings()
    }
  }, [user, authLoading, router])

  const fetchBookings = async () => {
    try {
      console.log("[v0] Starting to fetch bookings...")

      const healthResponse = await apiClient.healthCheck()
      console.log("[v0] Health check response:", healthResponse)

      if (healthResponse.error) {
        setError("API connection failed: " + healthResponse.error)
        setLoading(false)
        return
      }

      const response = await apiClient.getBookings()
      console.log("[v0] Bookings response:", response)

      if (response.data) {
        setBookings(response.data.bookings || [])
        setError("")
      } else {
        setError(response.error || "Failed to fetch bookings")
      }
    } catch (err) {
      console.error("[v0] Network error:", err)
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-muted-foreground">
            {user.role === "client"
              ? "Manage your photography bookings and discover new photographers."
              : "Manage your photography services and client bookings."}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "confirmed").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {user.role === "client" ? "Photographers" : "Clients"}
              </CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  new Set(
                    bookings.map((b) =>
                      user.role === "client"
                        ? `${b.photographer_first_name} ${b.photographer_last_name}`
                        : `${b.client_first_name} ${b.client_last_name}`,
                    ),
                  ).size
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>
              Your latest photography {user.role === "client" ? "bookings" : "appointments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading bookings...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 mb-2">Error: {error}</p>
                <p className="text-sm text-muted-foreground mb-4">
                  This might be due to missing environment variables or API configuration.
                </p>
                <Button onClick={fetchBookings} variant="outline" className="mt-4 bg-transparent">
                  Try Again
                </Button>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{booking.event_type}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(booking.event_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.event_time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {booking.location}
                          </span>
                        </div>
                        {user.role === "client" && booking.photographer_first_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            with {booking.photographer_first_name} {booking.photographer_last_name}
                          </p>
                        )}
                        {user.role === "photographer" && booking.client_first_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            for {booking.client_first_name} {booking.client_last_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      <span className="font-semibold">${booking.total_amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No bookings yet.</p>
                <Button asChild>
                  <a href={user.role === "client" ? "/search" : "/profile"}>
                    {user.role === "client" ? "Find Photographers" : "Complete Your Profile"}
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
