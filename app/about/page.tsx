import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        {/* About Us Section */}
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            About <span className="text-primary">FocalFinder</span>
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              FocalFinder is the premier marketplace connecting clients with talented photographers worldwide. We
              believe every moment deserves to be captured beautifully, and every photographer deserves to showcase
              their artistry to the right audience.
            </p>
            <p className="text-muted-foreground text-pretty">
              Founded in 2024, we've revolutionized how people find and book photography services. Our platform combines
              cutting-edge technology with human expertise to create seamless connections between creative professionals
              and those seeking to preserve their most precious memories.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                Our <span className="text-secondary">Mission</span>
              </h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                To democratize professional photography by making it accessible, affordable, and effortless for
                everyone. We strive to empower photographers to build thriving businesses while helping clients capture
                life's most important moments with confidence and ease.
              </p>
              <p className="text-muted-foreground text-pretty">
                Through our innovative platform, we're breaking down barriers between creative talent and those who need
                it most, fostering a community where artistry meets opportunity.
              </p>
            </div>
            <div className="relative">
              <img
                src="/photography-portfolio.png"
                alt="Photography Portfolio"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-lg" />
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <img
                src="/professional-photographer-woman-with-camera.png"
                alt="Professional Photographer"
                className="w-full h-80 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent rounded-lg" />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                Our <span className="text-accent">Vision</span>
              </h2>
              <p className="text-muted-foreground mb-6 text-pretty">
                To become the world's most trusted photography marketplace, where every photographer can thrive and
                every client can find their perfect creative match. We envision a future where professional photography
                is within reach for all life's celebrations.
              </p>
              <p className="text-muted-foreground text-pretty">
                By 2030, we aim to connect over 100,000 photographers with millions of clients globally, creating a
                sustainable ecosystem that celebrates creativity and preserves memories.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
              Meet Our <span className="text-primary">Team</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind FocalFinder, dedicated to connecting creativity with opportunity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Alex Thompson",
                role: "CEO & Founder",
                bio: "Former photographer turned entrepreneur with 15+ years in the creative industry.",
                image: "/professional-photographer-man-portrait.png",
                expertise: "Leadership",
              },
              {
                name: "Maria Garcia",
                role: "CTO",
                bio: "Tech visionary with expertise in marketplace platforms and user experience design.",
                image: "/professional-photographer-woman-portrait.png",
                expertise: "Technology",
              },
              {
                name: "David Kim",
                role: "Head of Photography",
                bio: "Award-winning photographer who ensures quality standards across our platform.",
                image: "/professional-photographer-man-portrait.png",
                expertise: "Photography",
              },
              {
                name: "Sophie Chen",
                role: "Head of Marketing",
                bio: "Creative strategist passionate about connecting brands with their perfect audience.",
                image: "/professional-photographer-woman-with-camera.png",
                expertise: "Marketing",
              },
            ].map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={member.image || "/placeholder.svg"} alt={member.name} />
                  <AvatarFallback>
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <Badge variant="secondary" className="mb-3">
                  {member.expertise}
                </Badge>
                <p className="text-sm text-muted-foreground text-pretty">{member.bio}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
