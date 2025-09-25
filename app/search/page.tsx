"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SearchFilters } from "@/components/ui/search-filters"
import { PhotographerCard } from "@/components/ui/photographer-card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

interface Photographer {
  id: string
  first_name: string
  last_name: string
  specialty: string
  location: string
  hourly_rate: number
  rating_average: number
  rating_count: number
  profile_image_url: string
  cover_image_url?: string
  is_available: boolean
}

export default function SearchPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filters, setFilters] = useState({})
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })

  const fetchPhotographers = async (newFilters = {}, page = 1) => {
    setLoading(true)
    setError("")

    try {
      const response = await apiClient.searchPhotographers({
        ...newFilters,
        page,
        limit: pagination.limit,
      })

      if (response.data) {
        setPhotographers(response.data.photographers || [])
        setPagination(response.data.pagination || pagination)
        console.log("Fetched photographers:", response.data.photographers)
      } else {
        setError(response.error || "Failed to fetch photographers")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotographers()

  }, [])

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    fetchPhotographers(newFilters, 1)
  }

  const handlePageChange = (newPage: number) => {
    fetchPhotographers(filters, newPage)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Find Your Perfect Photographer
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Browse through our curated selection of professional photographers and find the perfect match for your
            needs.
          </p>
        </div>

        <SearchFilters onFiltersChange={handleFiltersChange} />

        {error && <div className="mt-6 p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading photographers...</span>
            </div>
          ) : photographers.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photographers.map((photographer) => (
                  <PhotographerCard
                    key={photographer.id}
                    photographer={{
                      id: photographer.id,
                      name: `${photographer.first_name} ${photographer.last_name}`,
                      specialty: photographer.specialty,
                      location: photographer.location,
                      rating: photographer.rating_average,
                      reviewCount: photographer.rating_count,
                      hourlyRate: photographer.hourly_rate,
                      // avatar for avatar slot
                      profileImage: photographer.profile_image_url,
                      // use the first portfolio image as the cover; fallback to placeholder
                      portfolioImages: [photographer.cover_image_url || "/photography-portfolio.png"],
                      isAvailable: photographer.is_available,
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No photographers found matching your criteria.</p>
              <Button variant="outline" onClick={() => handleFiltersChange({})} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
