"use client"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    // keep baseUrl empty to use relative paths in dev/production if NEXT_PUBLIC_API_URL not set
    this.baseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    // normalize endpoint so it always targets /api/... on the same origin when baseUrl is empty
    const normalizedEndpoint = endpoint.startsWith("/api")
      ? endpoint
      : endpoint.startsWith("/")
      ? `/api${endpoint}`
      : `/api/${endpoint}`

    const url = this.baseUrl ? `${this.baseUrl}${normalizedEndpoint}` : normalizedEndpoint

    const opts: RequestInit = {
      // IMPORTANT: include credentials so browser sends httpOnly auth cookie
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    }

    try {
      const res = await fetch(url, opts)
      const text = await res.text()
      const json = text ? JSON.parse(text) : {}

      if (!res.ok) {
        return { error: json?.error || json?.message || res.statusText }
      }

      return { data: json }
    } catch (err: any) {
      return { error: err?.message || "Network error" }
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
