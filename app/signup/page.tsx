"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Camera, User, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function SignUpPage() {
  const [userType, setUserType] = useState<"client" | "photographer" | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    specialty: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { signup } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) {
      setError("Please select whether you want to hire or offer services")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    const result = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: userType,
      specialty: userType === "photographer" ? formData.specialty : undefined,
    })

    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Signup failed")
    }

    setLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif font-bold text-primary">
            FocalFinder
          </Link>
          <p className="text-muted-foreground mt-2">Create your account</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">Sign Up</CardTitle>
            <CardDescription>Join FocalFinder and start your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>
            )}

            {/* User Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">I want to:</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("client")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    userType === "client" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium">Hire</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Find and book photographers</p>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("photographer")}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    userType === "photographer"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-5 h-5 text-primary" />
                    <span className="font-medium">Offer Services</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Provide photography services</p>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    className="bg-input border-border"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    className="bg-input border-border"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  className="bg-input border-border"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  className="bg-input border-border"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="bg-input border-border"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {userType === "photographer" && (
                <div className="space-y-2">
                  <Label htmlFor="specialty">Photography Specialty</Label>
                  <select
                    id="specialty"
                    name="specialty"
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select your specialty</option>
                    <option value="Wedding Photography">Wedding Photography</option>
                    <option value="Portrait Photography">Portrait Photography</option>
                    <option value="Event Photography">Event Photography</option>
                    <option value="Fashion Photography">Fashion Photography</option>
                    <option value="Corporate Photography">Corporate Photography</option>
                    <option value="Product Photography">Product Photography</option>
                    <option value="Real Estate Photography">Real Estate Photography</option>
                    <option value="Nature Photography">Nature Photography</option>
                  </select>
                </div>
              )}

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded border-border text-primary focus:ring-primary"
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={!userType || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
                {userType && (
                  <Badge className="ml-2 bg-secondary text-secondary-foreground">
                    {userType === "client" ? "Client" : "Photographer"}
                  </Badge>
                )}
              </Button>
            </form>


            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
