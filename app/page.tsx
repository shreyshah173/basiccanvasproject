"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const [dimensions, setDimensions] = useState({
    width: 1200,
    height: 800,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/presentation?width=${dimensions.width}&height=${dimensions.height}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Canvas Dimensions</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  min={100}
                  max={1000000}
                  value={dimensions.width}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      width: Math.max(100, Math.min(1000000, Number(e.target.value) || 100)),
                    }))
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  min={100}
                  max={1000000}
                  value={dimensions.height}
                  onChange={(e) =>
                    setDimensions((prev) => ({
                      ...prev,
                      height: Math.max(100, Math.min(1000000, Number(e.target.value) || 100)),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Common Presets</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => setDimensions({ width: 1920, height: 1080 })}>
                    1920 × 1080 (16:9)
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDimensions({ width: 1280, height: 720 })}>
                    1280 × 720 (16:9)
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDimensions({ width: 1024, height: 768 })}>
                    1024 × 768 (4:3)
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDimensions({ width: 800, height: 600 })}>
                    800 × 600 (4:3)
                  </Button>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full">
              Create Canvas
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

