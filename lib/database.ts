import { Pool } from "pg"

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Database query helper
export async function query(text: string, params?: any[]) {
  const start = Date.now()
  const client = await pool.connect()

  try {
    const result = await client.query(text, params)
    const duration = Date.now() - start
    console.log("Executed query", { text, duration, rows: result.rowCount })
    return result
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Transaction helper
export async function transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query("BEGIN")
    const result = await callback(client)
    await client.query("COMMIT")
    return result
  } catch (error) {
    await client.query("ROLLBACK")
    console.error("Transaction error:", error)
    throw error
  } finally {
    client.release()
  }
}

// Database models and types
export interface User {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  role: "client" | "photographer" | "admin"
  phone?: string
  is_verified: boolean
  verification_token?: string
  reset_password_token?: string
  reset_password_expires?: Date
  created_at: Date
  updated_at: Date
}

export interface PhotographerProfile {
  id: string
  user_id: string
  bio?: string
  specialty: string
  location: string
  latitude?: number
  longitude?: number
  hourly_rate: number
  years_experience: number
  equipment?: string
  travel_distance: number
  profile_image_url?: string
  cover_image_url?: string
  is_available: boolean
  rating_average: number
  rating_count: number
  created_at: Date
  updated_at: Date
}

export interface PortfolioItem {
  id: string
  photographer_id: string
  image_url: string
  title?: string
  description?: string
  category?: string
  is_featured: boolean
  sort_order: number
  created_at: Date
}

export interface ServicePackage {
  id: string
  photographer_id: string
  name: string
  description?: string
  price: number
  duration_hours: number
  features: string[]
  is_active: boolean
  sort_order: number
  created_at: Date
  updated_at: Date
}

export interface Booking {
  id: string
  client_id: string
  photographer_id: string
  package_id?: string
  event_date: Date
  event_time: string
  duration_hours: number
  location: string
  event_type: string
  special_requests?: string
  total_amount: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  payment_status: "pending" | "paid" | "refunded"
  payment_intent_id?: string
  booking_notes?: string
  created_at: Date
  updated_at: Date
}

export interface Review {
  id: string
  booking_id: string
  client_id: string
  photographer_id: string
  rating: number
  comment?: string
  is_public: boolean
  created_at: Date
  updated_at: Date
}

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  recipient_id: string
  message: string
  attachments: string[]
  is_read: boolean
  created_at: Date
}

// Database helper functions
export const db = {
  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE email = $1", [email])
    return result.rows[0] || null
  },

  async getUserById(id: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE id = $1", [id])
    return result.rows[0] || null
  },

  async createUser(userData: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
    const result = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userData.email,
        userData.password_hash,
        userData.first_name,
        userData.last_name,
        userData.role,
        userData.phone,
        userData.is_verified,
      ],
    )
    return result.rows[0]
  },

  // Photographer operations
  async getPhotographerProfiles(filters: {
    location?: string
    specialty?: string
    priceRange?: string
    availability?: string
    page?: number
    limit?: number
  }): Promise<{ photographers: PhotographerProfile[]; total: number }> {
    let whereClause = "WHERE pp.is_available = true"
    const params: any[] = []
    let paramCount = 0

    if (filters.location) {
      paramCount++
      whereClause += ` AND pp.location ILIKE $${paramCount}`
      params.push(`%${filters.location}%`)
    }

    if (filters.specialty) {
      paramCount++
      whereClause += ` AND pp.specialty ILIKE $${paramCount}`
      params.push(`%${filters.specialty}%`)
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number)
      if (max) {
        paramCount++
        whereClause += ` AND pp.hourly_rate BETWEEN $${paramCount} AND $${paramCount + 1}`
        params.push(min, max)
        paramCount++
      } else {
        paramCount++
        whereClause += ` AND pp.hourly_rate >= $${paramCount}`
        params.push(min)
      }
    }

    const page = filters.page || 1
    const limit = filters.limit || 12
    const offset = (page - 1) * limit

    const countResult = await query(
      `SELECT COUNT(*) FROM photographer_profiles pp
       JOIN users u ON pp.user_id = u.id
       ${whereClause}`,
      params,
    )

    const result = await query(
      `SELECT pp.*, u.first_name, u.last_name, u.email
       FROM photographer_profiles pp
       JOIN users u ON pp.user_id = u.id
       ${whereClause}
       ORDER BY pp.rating_average DESC, pp.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset],
    )

    return {
      photographers: result.rows,
      total: Number.parseInt(countResult.rows[0].count),
    }
  },

  async getPhotographerById(id: string): Promise<PhotographerProfile | null> {
    const result = await query(
      `SELECT pp.*, u.first_name, u.last_name, u.email
       FROM photographer_profiles pp
       JOIN users u ON pp.user_id = u.id
       WHERE pp.id = $1`,
      [id],
    )
    return result.rows[0] || null
  },

  // Booking operations
  async createBooking(bookingData: Omit<Booking, "id" | "created_at" | "updated_at">): Promise<Booking> {
    const result = await query(
      `INSERT INTO bookings (client_id, photographer_id, package_id, event_date, event_time, 
                            duration_hours, location, event_type, special_requests, total_amount, 
                            status, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        bookingData.client_id,
        bookingData.photographer_id,
        bookingData.package_id,
        bookingData.event_date,
        bookingData.event_time,
        bookingData.duration_hours,
        bookingData.location,
        bookingData.event_type,
        bookingData.special_requests,
        bookingData.total_amount,
        bookingData.status,
        bookingData.payment_status,
      ],
    )
    return result.rows[0]
  },

  async getBookingsByUserId(userId: string, role: string): Promise<Booking[]> {
    const column = role === "photographer" ? "photographer_id" : "client_id"
    const result = await query(
      `SELECT b.*, 
              u_client.first_name as client_first_name, u_client.last_name as client_last_name,
              u_photographer.first_name as photographer_first_name, u_photographer.last_name as photographer_last_name,
              pp.profile_image_url as photographer_image
       FROM bookings b
       JOIN users u_client ON b.client_id = u_client.id
       JOIN photographer_profiles pp ON b.photographer_id = pp.id
       JOIN users u_photographer ON pp.user_id = u_photographer.id
       WHERE b.${column} = $1
       ORDER BY b.event_date DESC`,
      [userId],
    )
    return result.rows
  },
}

export default pool
