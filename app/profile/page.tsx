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
  url: string
  caption?: string | null
  category?: string | null
  isFeatured?: boolean
  createdAt?: string
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
  const [uploading, setUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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

  // Service packages: load/create/update/delete
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPackage, setNewPackage] = useState({
    name: "",
    description: "",
    price: "",
    duration_hours: "",
    features: "",
    is_active: true,
  })
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "photographer")) {
      router.push("/login")
      return
    }

    if (user && user.role === "photographer") {
      loadProfileData()
      loadPortfolioItems()
      loadServicePackages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router])

  const loadProfileData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/photographer/profile", { credentials: "include" })
      const json = await res.json()
      if (json?.user) {
        setProfileData((prev) => ({
          ...prev,
          specialty: json.user.specialty ?? "",
        }))
      }
      if (json?.profile) {
        setAvatarUrl(json.profile.profileImageUrl ?? null)
        setProfileData((prev) => ({
          ...prev,
          bio: json.profile.bio ?? "",
          location: json.profile.location ?? "",
          hourlyRate: json.profile.hourlyRate ? String(json.profile.hourlyRate) : "",
          yearsExperience: json.profile.yearsExperience ? String(json.profile.yearsExperience) : "",
          equipment: json.profile.equipment ?? "",
          travelDistance: json.profile.travelDistance ?? "",
        }))
      }
    } catch (error) {
      console.error("Failed to load profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadPortfolioItems = async () => {
    try {
      const res = await fetch("/api/photographer/portfolio", { credentials: "include" })
      const json = await res.json()
      if (res.ok && Array.isArray(json.items)) {
        setPortfolioItems(
          json.items.map((it: any) => ({
            id: it.id,
            url: it.url,
            caption: it.caption ?? "",
            category: it.category ?? "",
            isFeatured: Boolean(it.isFeatured),
            createdAt: it.createdAt,
          }))
        )
      } else {
        console.error("Failed to fetch portfolio items:", json)
      }
    } catch (err) {
      console.error("Error loading portfolio items:", err)
    }
  }

  const loadServicePackages = async () => {
    try {
      const res = await fetch("/api/photographer/packages", { credentials: "include" })
      const json = await res.json()
      if (res.ok && Array.isArray(json.items)) {
        setServicePackages(
          json.items.map((it: any) => ({
            id: it.id,
            name: it.name,
            description: it.description ?? "",
            price: it.price ?? 0,
            duration_hours: it.duration_hours ?? 0,
            features: Array.isArray(it.features) ? it.features : [],
            is_active: Boolean(it.is_active),
          }))
        )
      } else {
        console.error("Failed to fetch service packages:", json)
      }
    } catch (err) {
      console.error("Error loading packages:", err)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        bio: profileData.bio || null,
        specialty: profileData.specialty || null,
        location: profileData.location || null,
        hourlyRate: profileData.hourlyRate !== "" ? Number(profileData.hourlyRate) : null,
        yearsExperience: profileData.yearsExperience !== "" ? Number(profileData.yearsExperience) : null,
        equipment: profileData.equipment || null,
        travelDistance: profileData.travelDistance || null,
      }

      const res = await fetch("/api/photographer/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) {
        console.error("Profile update failed:", json)
      } else {
        if (json.profile) {
          setProfileData((prev) => ({
            ...prev,
            bio: json.profile.bio ?? prev.bio,
            specialty: json.profile.specialty ?? prev.specialty,
            location: json.profile.location ?? prev.location,
            hourlyRate: json.profile.hourlyRate ? String(json.profile.hourlyRate) : prev.hourlyRate,
            yearsExperience: json.profile.yearsExperience ? String(json.profile.yearsExperience) : prev.yearsExperience,
            equipment: json.profile.equipment ?? prev.equipment,
            travelDistance: json.profile.travelDistance ?? prev.travelDistance,
          }))
        }
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded: PortfolioItem[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fd = new FormData()
        fd.append("file", file)
        // optional: you can add caption/category/isFeatured fields here
        fd.append("caption", file.name)
        // send request
        const res = await fetch("/api/photographer/portfolio", {
          method: "POST",
          credentials: "include",
          body: fd,
        })
        const json = await res.json()
        if (res.ok && json.item) {
          uploaded.push({
            id: json.item.id,
            url: json.item.url,
            caption: json.item.caption ?? "",
            category: json.item.category ?? "",
            isFeatured: Boolean(json.item.isFeatured),
            createdAt: json.item.createdAt,
          })
        } else {
          console.error("Upload failed for file", file.name, json)
        }
      }
      if (uploaded.length) {
        setPortfolioItems((prev) => [...uploaded, ...prev])
      }
      // clear input value to allow re-upload of same file if needed
      ;(e.target as HTMLInputElement).value = ""
    } catch (err) {
      console.error("Image upload error:", err)
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePackage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const payload = {
      name: newPackage.name,
      description: newPackage.description || undefined,
      price: newPackage.price === "" ? null : Number(newPackage.price),
      duration_hours: newPackage.duration_hours === "" ? null : Number(newPackage.duration_hours),
      features: newPackage.features ? newPackage.features.split(",").map((s) => s.trim()) : undefined,
      is_active: Boolean(newPackage.is_active),
    }
    try {
      const res = await fetch("/api/photographer/packages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok && json.item) {
        setServicePackages((prev) => [json.item, ...prev])
        setNewPackage({ name: "", description: "", price: "", duration_hours: "", features: "", is_active: true })
        setShowAddForm(false)
      } else {
        console.error("Create package failed:", json)
      }
    } catch (err) {
      console.error("Create package error:", err)
    }
  }

  const handleStartEdit = (pkg: ServicePackage) => {
    setEditingPackageId(pkg.id)
    setNewPackage({
      name: pkg.name,
      description: pkg.description ?? "",
      price: String(pkg.price ?? ""),
      duration_hours: String(pkg.duration_hours ?? ""),
      features: (pkg.features || []).join(", "),
      is_active: pkg.is_active,
    })
    setShowAddForm(true)
  }

  const handleUpdatePackage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!editingPackageId) return
    const payload = {
      name: newPackage.name,
      description: newPackage.description || null,
      price: newPackage.price === "" ? null : Number(newPackage.price),
      duration_hours: newPackage.duration_hours === "" ? null : Number(newPackage.duration_hours),
      features: newPackage.features ? newPackage.features.split(",").map((s) => s.trim()) : null,
      is_active: Boolean(newPackage.is_active),
    }
    try {
      const res = await fetch(`/api/photographer/packages/${editingPackageId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (res.ok && json.item) {
        setServicePackages((prev) => prev.map((p) => (p.id === json.item.id ? json.item : p)))
        setEditingPackageId(null)
        setNewPackage({ name: "", description: "", price: "", duration_hours: "", features: "", is_active: true })
        setShowAddForm(false)
      } else {
        console.error("Update package failed:", json)
      }
    } catch (err) {
      console.error("Update package error:", err)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Delete this package?")) return
    try {
      const res = await fetch(`/api/photographer/packages/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setServicePackages((prev) => prev.filter((p) => p.id !== id))
      } else {
        console.error("Delete package failed:", json)
      }
    } catch (err) {
      console.error("Delete package error:", err)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return
    try {
      const res = await fetch(`/api/photographer/portfolio/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (res.ok && json.success) {
        setPortfolioItems((prev) => prev.filter((p) => p.id !== id))
      } else {
        console.error("Failed to delete item:", json)
      }
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setAvatarUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", files[0])
      const res = await fetch("/api/photographer/profile/avatar", {
        method: "POST",
        credentials: "include",
        body: fd,
      })
      const json = await res.json()
      if (res.ok && json.profile) {
        setAvatarUrl(json.profile.profileImageUrl ?? null)
      } else {
        console.error("Avatar upload failed:", json)
      }
      ;(e.target as HTMLInputElement).value = ""
    } catch (err) {
      console.error("Avatar upload error:", err)
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm("Remove profile picture?")) return
    try {
      const res = await fetch("/api/photographer/profile/avatar", {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (res.ok && json.profile) {
        setAvatarUrl(null)
      } else {
        console.error("Remove avatar failed:", json)
      }
    } catch (err) {
      console.error("Remove avatar error:", err)
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
        {/* <div className="mb-6 flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            <img src={avatarUrl ?? "/placeholder-avatar.png"} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2 items-center">
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            <label htmlFor="avatar-upload">
              <Button variant="outline" disabled={avatarUploading}>
                {avatarUploading ? "Uploading..." : "Change Picture"}
              </Button>
            </label>
            {avatarUrl && (
              <Button variant="ghost" onClick={handleRemoveAvatar}>
                Remove
              </Button>
            )}
          </div>
        </div> */}

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
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab.id
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
            <CardContent>
              <div className="mb-6 flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <img src={avatarUrl ?? "/profile-placeholder  .png"} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2 items-center">
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <Button asChild variant="outline" disabled={avatarUploading}>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      {avatarUploading ? "Uploading..." : "Change Picture"}
                    </label>
                  </Button>
                  {avatarUrl && (
                    <Button variant="ghost" onClick={handleRemoveAvatar}>
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
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
                    <Button asChild variant="outline" disabled={uploading}>
                      <label htmlFor="portfolio-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload Images"}
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
                          src={item.url || "/placeholder.svg"}
                          alt={item.caption || "Portfolio image"}
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
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-medium text-sm">{item.caption ?? "Untitled"}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.category ?? "Uncategorized"}
                          </Badge>
                          {item.isFeatured && <Badge className="text-xs bg-primary">Featured</Badge>}
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
                  <Button className="bg-primary hover:bg-primary/90" onClick={() => { setShowAddForm((s) => !s); setEditingPackageId(null) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    {showAddForm ? "Close" : "Add Package"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <form onSubmit={editingPackageId ? handleUpdatePackage : handleCreatePackage} className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pkg-name">Name</Label>
                        <Input id="pkg-name" value={newPackage.name} onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="pkg-price">Price</Label>
                        <Input id="pkg-price" type="number" value={newPackage.price} onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="pkg-duration">Duration (hours)</Label>
                        <Input id="pkg-duration" type="number" value={newPackage.duration_hours} onChange={(e) => setNewPackage({ ...newPackage, duration_hours: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="pkg-active">Active</Label>
                        <div className="mt-1">
                          <input id="pkg-active" type="checkbox" checked={newPackage.is_active} onChange={(e) => setNewPackage({ ...newPackage, is_active: e.target.checked })} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pkg-desc">Description</Label>
                      <Textarea id="pkg-desc" value={newPackage.description} onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })} rows={3} />
                    </div>
                    <div>
                      <Label htmlFor="pkg-features">Features (comma separated)</Label>
                      <Input id="pkg-features" value={newPackage.features} onChange={(e) => setNewPackage({ ...newPackage, features: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-primary">{editingPackageId ? "Update Package" : "Create Package"}</Button>
                      <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); setEditingPackageId(null) }}>Cancel</Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {servicePackages.map((pkg) => (
                    <div key={pkg.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{pkg.name}</h3>
                          <p className="text-muted-foreground">{pkg.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={pkg.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => handleStartEdit(pkg)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeletePackage(pkg.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">Price</span>
                          <p className="text-xl font-bold">${pkg.price ?? 0}</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <p className="font-medium">{pkg.duration_hours ?? 0} hours</p>
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">Features</span>
                          <p className="font-medium">{(pkg.features || []).length} included</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Included Features:</span>
                        <ul className="mt-1 space-y-1">
                          {(pkg.features || []).map((feature, index) => (
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
