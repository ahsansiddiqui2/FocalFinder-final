"use client"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/api${endpoint}`
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        credentials: "include", // Include cookies for authentication
        ...options,
      }

      console.log("[v0] Making API request to:", url)
      const response = await fetch(url, config)
      console.log("[v0] Response status:", response.status, response.statusText)

      const contentType = response.headers.get("content-type")
      console.log("[v0] Response content-type:", contentType)

      if (!contentType || !contentType.includes("application/json")) {
        // If it's not JSON, get the text to see what the actual error is
        const text = await response.text()
        console.error("[v0] Non-JSON response received:", text.substring(0, 200))
        return { error: `Server returned non-JSON response: ${response.status} ${response.statusText}` }
      }

      const data = await response.json()
      console.log("[v0] Parsed JSON data:", data)

      if (!response.ok) {
        return { error: data.error || "An error occurred" }
      }

      return { data }
    } catch (error) {
      console.error("[v0] API request failed:", error)
      return { error: "Network error occurred" }
    }
  }

  async healthCheck() {
    return this.request("/health")
  }

  async testConnection() {
    return this.request("/test")
  }

  // Authentication methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: "client" | "photographer"
    specialty?: string
  }) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  async getCurrentUser() {
    return this.request("/auth/me")
  }

  // Photographer methods
  async searchPhotographers(filters: {
    location?: string
    specialty?: string
    priceRange?: string
    availability?: string
    page?: number
    limit?: number
  }) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, value.toString())
      }
    })

    return this.request(`/photographers?${params.toString()}`)
  }

  async getPhotographer(id: string) {
    return this.request(`/photographers/${id}`)
  }

  // Booking methods
  async createBooking(bookingData: {
    photographerId: string
    packageId?: string
    eventDate: string
    eventTime: string
    duration: number
    location: string
    eventType: string
    specialRequests?: string
    totalAmount: number
  }) {
    return this.request("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    })
  }

  async getBookings() {
    return this.request("/bookings")
  }
}

export const apiClient = new ApiClient()
