"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { Camera, Upload, Plus, Edit, Trash2, Eye, Calendar, DollarSign, Loader2 } from "lucide-react"

interface PortfolioItem {
  id: string
  image_url: string
  title: string
  category: string
  is_featured: boolean
}

interface ServicePackage {
  id: string
  name: string
  description: string
  price: number
  duration_hours: number
  features: string[]
  is_active: boolean
}

interface Order {
  id: string
  client_name: string
  event_type: string
  event_date: string
  event_time: string
  location: string
  status: string
  total_amount: number
}

export default function PhotographerProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Profile form state
  const [profileData, setProfileData] = useState({
    bio: "",
    specialty: "",
    location: "",
    hourlyRate: "",
    yearsExperience: "",
    equipment: "",
    travelDistance: "",
  })

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "photographer")) {
      router.push("/login")
      return
    }

    if (user && user.role === "photographer") {
      loadProfileData()
    }
  }, [user, authLoading, router])

  const loadProfileData = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API calls
      setPortfolioItems([
        {
          id: "1",
          image_url: "/wedding-photography-couple-dancing.png",
          title: "Romantic Wedding Ceremony",
          category: "Wedding",
          is_featured: true,
        },
        {
          id: "2",
          image_url: "/fashion-photography-model-portrait.png",
          title: "Fashion Portrait Session",
          category: "Fashion",
          is_featured: false,
        },
      ])

      setServicePackages([
        {
          id: "1",
          name: "Basic Wedding Package",
          description: "Perfect for intimate ceremonies",
          price: 800,
          duration_hours: 4,
          features: ["4 hours coverage", "200+ edited photos", "Online gallery"],
          is_active: true,
        },
        {
          id: "2",
          name: "Premium Wedding Package",
          description: "Complete wedding day coverage",
          price: 1800,
          duration_hours: 8,
          features: ["8 hours coverage", "600+ edited photos", "Second photographer", "USB drive"],
          is_active: true,
        },
      ])

      setOrders([
        {
          id: "1",
          client_name: "Jessica & Mike",
          event_type: "Wedding",
          event_date: "2024-06-15",
          event_time: "14:00",
          location: "San Francisco, CA",
          status: "confirmed",
          total_amount: 1200,
        },
        {
          id: "2",
          client_name: "Amanda Rodriguez",
          event_type: "Portrait Session",
          event_date: "2024-05-20",
          event_time: "10:00",
          location: "Golden Gate Park",
          status: "completed",
          total_amount: 400,
        },
      ])
    } catch (error) {
      console.error("Failed to load profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: Implement profile update API call
      console.log("Updating profile:", profileData)
      // Mock success
      setTimeout(() => setLoading(false), 1000)
    } catch (error) {
      console.error("Failed to update profile:", error)
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      // TODO: Implement image upload logic
      console.log("Uploading images:", files)
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
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">Photographer Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile, portfolio, and bookings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 border-b">
          {[
            { id: "profile", label: "Profile Settings", icon: Edit },
            { id: "portfolio", label: "Portfolio", icon: Camera },
            { id: "packages", label: "Service Packages", icon: DollarSign },
            { id: "orders", label: "Orders", icon: Calendar },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Settings Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your professional profile and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="specialty">Photography Specialty</Label>
                    <Input
                      id="specialty"
                      value={profileData.specialty}
                      onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                      placeholder="e.g., Wedding Photography"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={profileData.hourlyRate}
                      onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                      placeholder="150"
                    />
                  </div>
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={profileData.yearsExperience}
                      onChange={(e) => setProfileData({ ...profileData, yearsExperience: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell clients about your photography style and experience..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="equipment">Equipment & Gear</Label>
                  <Textarea
                    id="equipment"
                    value={profileData.equipment}
                    onChange={(e) => setProfileData({ ...profileData, equipment: e.target.value })}
                    placeholder="List your cameras, lenses, and other professional equipment..."
                    rows={3}
                  />
                </div>
                <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Portfolio Management</CardTitle>
                    <CardDescription>Upload and manage your photography portfolio</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="portfolio-upload"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="portfolio-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Images
                      </label>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="relative group">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="secondary">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.is_featured && <Badge className="text-xs bg-primary">Featured</Badge>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Service Packages Tab */}
        {activeTab === "packages" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Packages</CardTitle>
                    <CardDescription>Create and manage your photography service packages</CardDescription>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Package
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {servicePackages.map((pkg) => (
                    <div key={pkg.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{pkg.name}</h3>
                          <p className="text-muted-foreground">{pkg.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                          >
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Price</span>
                          <p className="text-xl font-bold">${pkg.price}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <p className="font-medium">{pkg.duration_hours} hours</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Features</span>
                          <p className="font-medium">{pkg.features.length} included</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Included Features:</span>
                        <ul className="mt-1 space-y-1">
                          {pkg.features.map((feature, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Manage your photography bookings and client orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{order.client_name}</h3>
                        <p className="text-muted-foreground">{order.event_type}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        <span className="text-lg font-bold">${order.total_amount}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Date & Time</span>
                        <p className="font-medium">
                          {new Date(order.event_date).toLocaleDateString()} at {order.event_time}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location</span>
                        <p className="font-medium">{order.location}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Contact Client
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  )
}
