"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Search, MapPin, Calendar, DollarSign, X } from "lucide-react"

interface SearchFiltersProps {
  onFiltersChange?: (filters: any) => void
}

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [location, setLocation] = useState("")
  const [specialty, setSpecialty] = useState("")
  const [priceRange, setPriceRange] = useState("")
  const [availability, setAvailability] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const specialties = [
    "Wedding Photography",
    "Portrait Photography",
    "Event Photography",
    "Fashion Photography",
    "Corporate Photography",
    "Product Photography",
    "Real Estate Photography",
    "Nature Photography",
  ]

  const priceRanges = [
    { label: "Under $100/hr", value: "0-100" },
    { label: "$100-200/hr", value: "100-200" },
    { label: "$200-300/hr", value: "200-300" },
    { label: "$300+/hr", value: "300+" },
  ]

  const handleFilterChange = (type: string, value: string) => {
    const newFilters = { location, specialty, priceRange, availability }

    switch (type) {
      case "location":
        setLocation(value)
        newFilters.location = value
        break
      case "specialty":
        setSpecialty(value)
        newFilters.specialty = value
        break
      case "priceRange":
        setPriceRange(value)
        newFilters.priceRange = value
        break
      case "availability":
        setAvailability(value)
        newFilters.availability = value
        break
    }

    // Update active filters for display
    const filters = []
    if (newFilters.location) filters.push(`Location: ${newFilters.location}`)
    if (newFilters.specialty) filters.push(`Specialty: ${newFilters.specialty}`)
    if (newFilters.priceRange)
      filters.push(`Price: ${priceRanges.find((p) => p.value === newFilters.priceRange)?.label}`)
    if (newFilters.availability) filters.push(`Available: ${newFilters.availability}`)

    setActiveFilters(filters)
    onFiltersChange?.(newFilters)
  }

  const clearFilter = (filterText: string) => {
    if (filterText.startsWith("Location:")) {
      handleFilterChange("location", "")
    } else if (filterText.startsWith("Specialty:")) {
      handleFilterChange("specialty", "")
    } else if (filterText.startsWith("Price:")) {
      handleFilterChange("priceRange", "")
    } else if (filterText.startsWith("Available:")) {
      handleFilterChange("availability", "")
    }
  }

  const clearAllFilters = () => {
    setLocation("")
    setSpecialty("")
    setPriceRange("")
    setAvailability("")
    setActiveFilters([])
    onFiltersChange?.({ location: "", specialty: "", priceRange: "", availability: "" })
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by photographer name or keyword..."
            className="pl-10"
            value={location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <Input
              placeholder="City, State"
              value={location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Specialty</label>
            <Select value={specialty} onValueChange={(value) => handleFilterChange("specialty", value)}>
              <SelectTrigger>
                <SelectValue placeholder="All specialties" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Price Range
            </label>
            <Select value={priceRange} onValueChange={(value) => handleFilterChange("priceRange", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any price" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Availability
            </label>
            <Select value={availability} onValueChange={(value) => handleFilterChange("availability", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Available Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-foreground">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => clearFilter(filter)}
              >
                {filter}
                <X className="w-3 h-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
