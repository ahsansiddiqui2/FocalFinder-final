import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, MapPin, Camera } from "lucide-react"

interface PhotographerCardProps {
  photographer: {
    id: string
    name: string
    specialty: string
    location: string
    rating: number
    reviewCount: number
    hourlyRate: number
    profileImage: string
    portfolioImages: string[]
    isAvailable: boolean
  }
}

export function PhotographerCard({ photographer }: PhotographerCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Portfolio Preview */}
      <div className="relative h-48 bg-muted">
        <img
          src={photographer.portfolioImages[0] || "/placeholder.svg?height=192&width=400&query=photography portfolio"}
          alt={`${photographer.name}'s work`}
          className="w-full h-full object-cover"
        />
        {photographer.isAvailable && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white">Available</Badge>
        )}
      </div>

      <div className="p-6">
        {/* Photographer Info */}
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={photographer.profileImage || "/placeholder.svg"} alt={photographer.name} />
            <AvatarFallback>
              {photographer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{photographer.name}</h3>
            <p className="text-sm text-secondary font-medium">{photographer.specialty}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              {photographer.location}
            </div>
          </div>
        </div>

        {/* Rating and Reviews (uses reviews to render stars) */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              const filled = i < Math.round(Number(photographer.rating || 0))
              return (
                <Star
                  key={i}
                  className={`w-4 h-4 ${filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
              )
            })}
            <span className="font-medium ml-2">{Number(photographer.rating || 0).toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground text-sm">({photographer.reviewCount} reviews)</span>
        </div>

        {/* Pricing */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold text-foreground">${photographer.hourlyRate}</span>
            <span className="text-muted-foreground">/hour</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Camera className="w-4 h-4" />
            <span>Starting rate</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
            <a href={`/photographer/${photographer.id}`}>View Portfolio</a>
          </Button>
          <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" asChild>
            <a href={`/photographer/${photographer.id}`}>Book Now</a>
          </Button>
        </div>
      </div>
    </Card>
  )
}
