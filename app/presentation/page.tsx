"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Canvas } from "@/components/canvas"
import { Toolbar } from "@/components/toolbar"
import { Sidebar } from "@/components/sidebar"
import { SlidesNav } from "@/components/slides-nav"
import { FileControls } from "@/components/file-controls"
import type { Slide } from "@/types/presentation"
import { nanoid } from "nanoid"

// Sample data for elements and charts
const data = [
  {
    type: "element" as const,
    name: "Blue Rectangle",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60'>
      <rect width='120' height='60' fill='blue' stroke='black' stroke-width='3' rx='10' ry='10' />
    </svg>`,
    x: 50,
    y: 50,
    magn: 1,
    rotation: 0,
  },
  {
    type: "chart" as const,
    name: "Line Chart",
    x: 200,
    y: 300,
    magn: 1,
    rotation: 0,
    config: {
      chart: {
        type: "line",
        width: 400,
        height: 300,
      },
      title: { text: "Line Chart Example" },
      xAxis: {
        categories: ["Jan", "Feb", "Mar", "Apr"],
      },
      series: [
        {
          data: [15, 20, 35, 50],
          name: "Sales",
        },
        {
          data: [5, 15, 25, 35],
          name: "Revenue",
        },
      ],
    },
  },
  {
    type: "chart" as const,
    name: "Doughnut Chart",
    x: 500,
    y: 200,
    magn: 1,
    rotation: 0,
    config: {
      chart: {
        type: "pie",
        width: 300,
        height: 300,
      },
      title: { text: "" },
      plotOptions: {
        pie: {
          innerSize: "70%",
          borderWidth: 2,
          borderColor: "transparent",
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: [
        {
          name: "Data",
          data: [
            { name: "Moderate", y: 182, color: "#f6c23e" },
            { name: "Other", y: 100, color: "#e4e4e4" },
          ],
        },
      ],
    },
    centerText: "My Text",
  },
]

const createInitialSlide = (): Slide => ({
  id: nanoid(),
  elements: [],
  drawingElements: [],
  selectedElementIndex: null,
})

export default function PresentationPage() {
  const searchParams = useSearchParams()
  const width = Number(searchParams.get("width")) || 1200
  const height = Number(searchParams.get("height")) || 800

  const [slides, setSlides] = useState<Slide[]>(() => [createInitialSlide()])
  const [currentSlideId, setCurrentSlideId] = useState<string>(() => slides[0].id)

  const handleAddSlide = () => {
    const newSlide = createInitialSlide()
    setSlides((prev) => [...prev, newSlide])
    setCurrentSlideId(newSlide.id)
  }

  const handleDeleteSlide = (slideId: string) => {
    setSlides((prev) => {
      const newSlides = prev.filter((slide) => slide.id !== slideId)
      // If we're deleting the current slide, select the previous one or the first one
      if (slideId === currentSlideId) {
        const currentIndex = prev.findIndex((slide) => slide.id === slideId)
        const newCurrentSlide = newSlides[currentIndex - 1] || newSlides[0]
        if (newCurrentSlide) {
          setCurrentSlideId(newCurrentSlide.id)
        }
      }
      return newSlides.length > 0 ? newSlides : [createInitialSlide()]
    })
  }

  const handleReorderSlides = (draggedIndex: number, targetIndex: number) => {
    setSlides((prev) => {
      const newSlides = [...prev]
      const [draggedSlide] = newSlides.splice(draggedIndex, 1)
      newSlides.splice(targetIndex, 0, draggedSlide)
      return newSlides
    })
  }

  const handleSlideUpdate = (slideId: string, updates: Partial<Slide>) => {
    setSlides((prev) => prev.map((slide) => (slide.id === slideId ? { ...slide, ...updates } : slide)))
  }

  const handleSlidesLoad = (newSlides: Slide[]) => {
    if (newSlides.length > 0) {
      setSlides(newSlides)
      setCurrentSlideId(newSlides[0].id)
    }
  }

  const currentSlide = slides.find((slide) => slide.id === currentSlideId) || slides[0]

  return (
    <div className="flex h-screen">
      <Toolbar elements={data.filter((item) => item.type === "element")} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-hidden p-4 relative">
          <FileControls slides={slides} onSlidesLoad={handleSlidesLoad} />
          <Canvas slide={currentSlide} width={width} height={height} onUpdate={handleSlideUpdate} />
        </div>
        <SlidesNav
          slides={slides}
          currentSlideId={currentSlideId}
          onSlideSelect={setCurrentSlideId}
          onAddSlide={handleAddSlide}
          onDeleteSlide={handleDeleteSlide}
          onReorderSlides={handleReorderSlides}
          width={width}
          height={height}
        />
      </div>
      <Sidebar elements={data.filter((item) => item.type === "chart")} />
    </div>
  )
}

