"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api-client"
import {
  Star,
  MapPin,
  Camera,
  Clock,
  CheckCircle,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageCircle,
} from "lucide-react"

interface PhotographerGig {
  id: string
  firstName: string
  lastName: string
  email: string
  specialty: string
  location: string
  hourlyRate: number
  rating: number
  reviewCount: number
  bio: string
  profileImage: string
  portfolioImages: string[]
  isAvailable: boolean
  packages: {
    name: string
    price: number
    duration: string
    description: string
    features: string[]
  }[]
  reviews: {
    id: string
    clientName: string
    rating: number
    comment: string
    date: string
  }[]
}

export default function PhotographerGigPage() {
  const params = useParams()
  const router = useRouter()
  const [photographer, setPhotographer] = useState<PhotographerGig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [canReview, setCanReview] = useState(false)
  const [bookingToReviewId, setBookingToReviewId] = useState<string | null>(null)
  const [reviewRating, setReviewRating] = useState<number>(5)
  const [reviewComment, setReviewComment] = useState<string>("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchPhotographer(params.id as string)
    }
  }, [params.id])

  const fetchPhotographer = async (id: string) => {
    setLoading(true)
    try {
      const response = await apiClient.getPhotographer(id)
      if (response.data?.photographer) {
        setPhotographer(response.data.photographer)
        // check if current user can leave a review for this photographer
        try {
          const cr = await apiClient.canReviewPhotographer(id)
          if (!cr.error && cr.data?.canReview) {
            setCanReview(true)
            setBookingToReviewId(cr.data.bookingId ?? null)
          } else {
            setCanReview(false)
            setBookingToReviewId(null)
          }
        } catch (e) {
          setCanReview(false)
          setBookingToReviewId(null)
        }
      } else {
        setError(response.error || "Photographer not found")
      }
    } catch (err) {
      setError("Failed to load photographer details")
    } finally {
      setLoading(false)
    }
  }

  const handleBookNow = () => {
    if (photographer) {
      // Navigate to booking page with selected package
      router.push(`/book/${photographer.id}?package=${selectedPackage}`)
    }
  }

  const handleContactMe = async () => {
    if (!photographer) return
    try {
      // create or reuse conversation with this photographer
      const res = await apiClient.createConversation({ participantId: photographer.id })
      if (!res.error && res.data?.conversation?.id) {
        router.push(`/messages/${res.data.conversation.id}`)
      } else {
        // fallback to messages list
        router.push("/messages")
      }
    } catch (err) {
      console.error("Failed to create conversation:", err)
      router.push("/messages")
    }
  }

  const nextImage = () => {
    if (photographer) {
      setCurrentImageIndex((prev) => (prev === photographer.portfolioImages.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (photographer) {
      setCurrentImageIndex((prev) => (prev === 0 ? photographer.portfolioImages.length - 1 : prev - 1))
    }
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

  if (error || !photographer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Photographer Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => router.push("/search")} variant="outline">
            Browse Photographers
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <span>Photography & Design</span>
          <span>/</span>
          <span>{photographer.specialty}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Title & Actions */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                  I will capture your special moments with professional {photographer.specialty.toLowerCase()}
                </h1>

                {/* Photographer Info */}
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={photographer.profileImage || "/placeholder.svg"} alt={photographer.firstName} />
                    <AvatarFallback>
                      {photographer.firstName[0]}
                      {photographer.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{photographer.firstName}</span>
                      <Badge className="bg-primary text-white text-xs">Pro Choice</Badge>
                      <span className="text-sm text-muted-foreground">Level 2</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-foreground">{photographer.rating}</span>
                        <span>({photographer.reviewCount} reviews)</span>
                      </div>
                      <span>11 orders in queue</span>
                    </div>
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span>
                    <strong>People keep coming back!</strong> {photographer.firstName} has an exceptional number of
                    repeat buyers.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFavorited(!isFavorited)}
                  className="bg-transparent"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                  61
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={
                    photographer.portfolioImages[currentImageIndex] ||
                    "/placeholder.svg?height=400&width=600&query=photography portfolio"
                  }
                  alt="Portfolio work"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-2">
                {photographer.portfolioImages.slice(0, 4).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square bg-muted rounded-lg overflow-hidden border-2 transition-colors ${
                      currentImageIndex === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg?height=100&width=100&query=photography thumbnail"}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* About This Gig */}
            <Card>
              <CardHeader>
                <CardTitle>About This Gig</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{photographer.bio}</p>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{photographer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Camera className="w-4 h-4 text-muted-foreground" />
                    <span>{photographer.specialty}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({photographer.reviewCount})</CardTitle>
                <CardDescription>What clients say about {photographer.firstName}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {photographer.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {review.clientName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.clientName}</span>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Review form - only visible when client is eligible */}
                {canReview && bookingToReviewId && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Leave a review</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <label className="text-sm block mb-1">Rating</label>
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(Number(e.target.value))}
                          className="border rounded p-2"
                        >
                          {[5, 4, 3, 2, 1].map((r) => (
                            <option key={r} value={r}>
                              {r} star{r > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm block mb-1">Comment</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          rows={4}
                          className="w-full border rounded p-2"
                          placeholder="Share your experience..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          className="bg-primary"
                          disabled={submittingReview}
                          onClick={async () => {
                            setSubmittingReview(true)
                            try {
                              const res = await apiClient.createReview({
                                bookingId: bookingToReviewId!,
                                rating: reviewRating,
                                comment: reviewComment || null,
                              })
                              if (res.error) {
                                alert(res.error)
                              } else {
                                // refresh photographer to show new review
                                await fetchPhotographer(photographer.id)
                                setCanReview(false)
                                setBookingToReviewId(null)
                                setReviewComment("")
                                setReviewRating(5)
                              }
                            } catch (e) {
                              console.error(e)
                              alert("Failed to submit review")
                            } finally {
                              setSubmittingReview(false)
                            }
                          }}
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </Button>
                        <Button variant="outline" onClick={() => { setCanReview(false); setBookingToReviewId(null) }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
               </CardContent>
             </Card>
           </div>

          {/* Right Column - Pricing */}
          <div className="space-y-6">
            {/* Package Selection */}
            <Card>
              <CardContent className="p-0">
                <Tabs value={selectedPackage.toString()} onValueChange={(value) => setSelectedPackage(Number(value))}>
                  <TabsList className="grid w-full grid-cols-3 rounded-none">
                    {photographer.packages.map((pkg, index) => (
                      <TabsTrigger key={index} value={index.toString()} className="text-xs">
                        {pkg.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {photographer.packages.map((pkg, index) => (
                    <TabsContent key={index} value={index.toString()} className="p-6 space-y-4">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-1">{pkg.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-primary">PKR {pkg.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Delivery Time
                          </span>
                          <span className="font-medium">{pkg.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Revisions</span>
                          <span className="font-medium">5 Revisions</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">What's included</h4>
                        <ul className="space-y-1">
                          {pkg.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3 pt-4">
                        <Button
                          onClick={handleBookNow}
                          className="w-full bg-foreground hover:bg-foreground/90 text-background"
                        >
                          Continue
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                        <Button onClick={handleContactMe} variant="outline" className="w-full bg-transparent">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact me
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback className="text-xs">?</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">Need flexibility when hiring?</p>
                            <button className="text-primary hover:underline text-xs">Request an hourly offer</button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Hiring on an hourly basis is perfect for long-term projects, with easy automatic weekly
                          payments.
                        </p>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
