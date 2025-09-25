"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api-client"
import { Loader2 } from "lucide-react"

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const photographerId = params?.id as string
  const [photographer, setPhotographer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [date, setDate] = useState("") // yyyy-mm-dd
  const [time, setTime] = useState("") // HH:MM
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0)
  const [error, setError] = useState("")

  // new: two-step flow (1 = details, 2 = payment)
  const [step, setStep] = useState<1 | 2>(1)

  // fake payment fields
  const [cardName, setCardName] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    if (photographerId) fetchPhotographer(photographerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photographerId])

  const fetchPhotographer = async (id: string) => {
    setLoading(true)
    try {
      const res = await apiClient.getPhotographer(id)
      if (res.error) {
        setError(res.error)
      } else {
        setPhotographer(res.data.photographer)
      }
    } catch (e) {
      setError("Failed to load photographer")
    } finally {
      setLoading(false)
    }
  }

  const parseDurationHours = (durationText: string | undefined) => {
    if (!durationText) return 2
    const m = durationText.match(/(\d+)\s*hour/i)
    if (m) return Number(m[1])
    const n = parseFloat(durationText)
    return Number.isFinite(n) ? n : 2
  }

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault()
    setError("")
    if (!date || !time) {
      setError("Please select date and time")
      return
    }
    if (!photographer) {
      setError("Photographer not loaded")
      return
    }
    // basic validation OK — move to payment step
    setStep(2)
  }

  const resetPaymentForm = () => {
    setCardName("")
    setCardNumber("")
    setCardExpiry("")
    setCardCvc("")
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    // This submit is used from the payment step — perform fake payment then create booking
    e?.preventDefault()
    setError("")
    if (!photographer) {
      setError("Photographer not loaded")
      return
    }
    // basic fake card validation
    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setError("Please fill all card details")
      return
    }

    setPaymentLoading(true)
    try {
      // simulate payment processing delay
      await new Promise((res) => setTimeout(res, 1500))

      // after fake payment, create booking
      const start = new Date(`${date}T${time}`)
      const pkg = photographer.packages?.[selectedPackageIndex]
      const hours = parseDurationHours(pkg?.duration)
      const end = new Date(start.getTime() + hours * 60 * 60 * 1000)

      const payload = {
        photographerId,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        price: pkg?.price ?? 0,
        briefId: null,
      }

      const res = await apiClient.createBooking(payload as any)
      if (res.error) {
        if (res.error === "Time slot not available") setError("Selected time is already booked. Choose another slot.")
        else setError(res.error)
      } else {
        // success: prefer conversation returned by API, otherwise create/use conversation then navigate
        const convId = res.data?.conversation?.id
        if (convId) {
          router.push(`/messages/${convId}`)
        } else {
          // fallback: create/get conversation between users then navigate
          try {
            const convRes = await apiClient.createConversation({ participantId: photographer.id, bookingId: res.data?.booking?.id ?? null })
            if (!convRes.error && convRes.data?.conversation?.id) router.push(`/messages/${convRes.data.conversation.id}`)
            else router.push(`/messages`)
          } catch {
            router.push(`/messages`)
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "Booking/payment failed")
    } finally {
      setPaymentLoading(false)
      resetPaymentForm()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Book {photographer?.firstName ?? "Photographer"}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>
            ) : (
              <>
                {step === 1 ? (
                  <form onSubmit={handleContinue} className="space-y-4">
                    <div>
                      <Label>Package</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {(photographer?.packages || []).map((p: any, i: number) => (
                          <button
                            type="button"
                            key={p.id ?? i}
                            onClick={() => setSelectedPackageIndex(i)}
                            className={`p-3 border rounded text-left ${selectedPackageIndex === i ? "border-primary" : ""}`}
                          >
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-sm text-muted-foreground">{p.description}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">PKR {p.price}</div>
                                <div className="text-xs text-muted-foreground">{p.duration}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                      </div>
                      <div>
                        <Label>Start Time</Label>
                        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                      </div>
                    </div>

                    <div>
                      <Label>Total Price</Label>
                      <div className="text-xl font-bold">PKR {photographer?.packages?.[selectedPackageIndex]?.price ?? 0}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-primary">
                        Continue Booking
                      </Button>
                      <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  // Payment step (fake)
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h4 className="font-medium">Payment (test mode)</h4>
                      <p className="text-sm text-muted-foreground">Enter any card details to simulate payment.</p>
                    </div>

                    <div>
                      <Label>Cardholder Name</Label>
                      <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Card Number</Label>
                        <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" />
                      </div>
                      <div>
                        <Label>Expiry (MM/YY)</Label>
                        <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="12/34" />
                      </div>
                      <div>
                        <Label>CVC</Label>
                        <Input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} placeholder="123" />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" className="bg-primary" disabled={paymentLoading}>
                        {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Confirm Booking & Pay
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={paymentLoading}>
                        Back
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}