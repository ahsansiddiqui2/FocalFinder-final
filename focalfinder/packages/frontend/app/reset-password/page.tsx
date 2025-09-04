"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { CheckCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const [isReset, setIsReset] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password reset logic here
    setIsReset(true)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif font-bold text-primary">
            FocalFinder
          </Link>
          <p className="text-muted-foreground mt-2">Create a new password</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-serif">
              {isReset ? "Password Reset Complete" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {isReset ? "Your password has been successfully reset" : "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isReset ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Your password has been successfully reset. You can now sign in with your new password.
                  </p>
                </div>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your new password"
                    className="bg-input border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    className="bg-input border-border"
                    required
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Password requirements:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• At least 8 characters long</li>
                    <li>• Contains at least one uppercase letter</li>
                    <li>• Contains at least one lowercase letter</li>
                    <li>• Contains at least one number</li>
                  </ul>
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Reset Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
