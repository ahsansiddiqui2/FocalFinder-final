import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute top-20 left-10 w-64 h-32 text-accent/20" viewBox="0 0 200 100" fill="none">
              <path d="M0 50 Q50 20 100 50 T200 50" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M0 60 Q50 30 100 60 T200 60" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
            <svg className="absolute top-40 right-10 w-48 h-24 text-secondary/20" viewBox="0 0 150 75" fill="none">
              <path d="M0 37.5 Q37.5 15 75 37.5 T150 37.5" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground mb-6 text-balance relative z-10">
            Capture Moments.
            <br />
            Hire the Perfect <span className="text-secondary">Photographer</span>.
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty relative z-10">
            From weddings to fashion shoots, find talented photographers tailored to your vision — fast, easy, and
            trusted.
          </p>

          <Link href="/search">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg relative z-10"
            >
              Hire a Photographer
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src="/wedding-photography-couple-dancing.png"
              alt="Wedding Photography"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <Badge className="bg-primary text-primary-foreground mb-2">Wedding</Badge>
              <p className="text-sm">Romantic moments captured</p>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src="/fashion-photography-model-portrait.png"
              alt="Fashion Photography"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <Badge className="bg-secondary text-secondary-foreground mb-2">Fashion</Badge>
              <p className="text-sm">Professional portraits</p>
            </div>
          </div>
          <div className="relative h-64 rounded-lg overflow-hidden">
            <img
              src="/event-photography-corporate-gathering.png"
              alt="Event Photography"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <Badge className="bg-accent text-accent-foreground mb-2">Events</Badge>
              <p className="text-sm">Corporate & celebrations</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Professional Quality</h3>
            <p className="text-muted-foreground">Vetted photographers with proven portfolios and client reviews.</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Fast Booking</h3>
            <p className="text-muted-foreground">Book your perfect photographer in minutes, not days.</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Trusted Platform</h3>
            <p className="text-muted-foreground">Secure payments and satisfaction guarantee for peace of mind.</p>
          </Card>
        </div>

        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Featured <span className="text-primary">Photographers</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our top-rated photographers who consistently deliver exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah Chen",
                specialty: "Wedding Photography",
                rating: 4.9,
                reviews: 127,
                location: "San Francisco, CA",
                image: "/professional-photographer-woman-portrait.png",
              },
              {
                name: "Marcus Rodriguez",
                specialty: "Fashion & Portrait",
                rating: 4.8,
                reviews: 89,
                location: "New York, NY",
                image: "/professional-photographer-man-portrait.png",
              },
              {
                name: "Emily Johnson",
                specialty: "Event Photography",
                rating: 5.0,
                reviews: 156,
                location: "Los Angeles, CA",
                image: "/professional-photographer-woman-with-camera.png",
              },
            ].map((photographer, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={photographer.image || "/placeholder.svg"} alt={photographer.name} />
                    <AvatarFallback>
                      {photographer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold text-foreground mb-1">{photographer.name}</h3>
                  <p className="text-secondary font-medium mb-2">{photographer.specialty}</p>
                  <p className="text-sm text-muted-foreground mb-3">{photographer.location}</p>
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{photographer.rating}</span>
                    <span className="text-muted-foreground">({photographer.reviews} reviews)</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Simple. <span className="text-accent">Clients Love It.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three easy steps and have your perfect photographer booked today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold text-xl">
                1
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Browse & Compare</h3>
              <p className="text-muted-foreground">
                Search through hundreds of verified photographers, compare portfolios, and read reviews.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-secondary-foreground font-bold text-xl">
                2
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Book & Pay Securely</h3>
              <p className="text-muted-foreground">
                Choose your photographer, select your package, and pay securely through our platform.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-accent-foreground font-bold text-xl">
                3
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Capture Memories</h3>
              <p className="text-muted-foreground">
                Meet your photographer and let them capture your special moments professionally.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-20 text-center bg-muted rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Ready to Find Your Perfect Photographer?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied clients who found their ideal photographer through FocalFinder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                Start Browsing
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Join as Photographer
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
