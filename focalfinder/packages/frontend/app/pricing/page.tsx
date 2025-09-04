import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Pricing <span className="text-primary">Plans</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your photography needs. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Free Plan */}
          <Card className="p-8 relative border-2 border-muted">
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-foreground">0</span>
                <span className="text-muted-foreground ml-2">PKR/month</span>
              </div>

              <div className="text-left mb-8">
                <p className="font-medium text-foreground mb-4">It includes:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Create a professional photographer profile</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Get inquiries with clients based on your skills</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Basic feedback (5-6 photographers)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Email assistance during business hours</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-muted-foreground hover:bg-muted-foreground/90 text-background" size="lg">
                Start Now
              </Button>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 relative border-2 border-primary bg-gradient-to-b from-primary/5 to-transparent">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
              Most Popular
            </Badge>
            <div className="text-center">
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-primary">737</span>
                <span className="text-muted-foreground ml-2">PKR/Month</span>
              </div>

              <div className="text-left mb-8">
                <p className="font-medium text-foreground mb-4">Everything in Free + Exclusive Pro Tools:</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Unlimited Picture Quality Analysis</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Priority Client Matching</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Marketing Toolkit</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-muted-foreground">Dedicated Support</span>
                  </li>
                </ul>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                Go Pro
              </Button>
            </div>
          </Card>
        </div>

        {/* Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">Compare plans side-by-side:</h2>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Features</th>
                    <th className="text-center p-4 font-semibold text-foreground">Free</th>
                    <th className="text-center p-4 font-semibold text-primary">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {[
                    { feature: "Profile & Portfolio", free: true, pro: true },
                    { feature: "Basic AI Recommendations", free: true, pro: true },
                    { feature: "Advanced Analytics", free: false, pro: true },
                    { feature: "Unlimited Photo Analysis", free: false, pro: true },
                    { feature: "Priority Client Matching", free: false, pro: true },
                    { feature: "24/7 Support", free: false, pro: true },
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="p-4 font-medium text-foreground">{row.feature}</td>
                      <td className="p-4 text-center">
                        {row.free ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.pro ? (
                          <Check className="w-5 h-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 bg-muted rounded-2xl p-12">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of photographers who are growing their business with FocalFinder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
