"use client"

import { Download, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Slide } from "@/types/presentation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

interface FileControlsProps {
  slides: Slide[]
  onSlidesLoad: (slides: Slide[]) => void
}

export function FileControls({ slides, onSlidesLoad }: FileControlsProps) {
  const [error, setError] = useState<string | null>(null)

  const handleDownload = () => {
    try {
      const data = JSON.stringify(slides, null, 2)
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "presentation.json"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      setError("Failed to download presentation")
    }
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedSlides = JSON.parse(content) as Slide[]

        // Validate the structure
        if (!Array.isArray(parsedSlides)) {
          throw new Error("Invalid file format")
        }

        // Validate each slide
        parsedSlides.forEach((slide) => {
          if (!slide.id || !Array.isArray(slide.elements)) {
            throw new Error("Invalid slide format")
          }
        })

        onSlidesLoad(parsedSlides)
      } catch (error) {
        setError("Failed to parse presentation file. Please ensure it's a valid JSON file.")
      }
    }
    reader.readAsText(file)
    event.target.value = "" // Reset input
  }

  return (
    <>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDownload} title="Download Presentation">
          <Download className="h-4 w-4" />
        </Button>
        <div className="relative">
          <Button variant="outline" size="icon" className="relative" title="Upload Presentation">
            <Upload className="h-4 w-4" />
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="application/json"
              onChange={handleUpload}
            />
          </Button>
        </div>
      </div>

      <Dialog open={!!error} onOpenChange={() => setError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

