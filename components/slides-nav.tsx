"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircleIcon, Trash2Icon, GripVerticalIcon } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Slide } from "@/types/presentation"
import type { CanvasElement } from "@/types/canvas"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { LineChart, Line, PieChart, Pie, Cell } from "recharts"

interface SlidesNavProps {
  slides: Slide[]
  currentSlideId: string
  onSlideSelect: (slideId: string) => void
  onAddSlide: () => void
  onDeleteSlide: (slideId: string) => void
  onReorderSlides: (startIndex: number, endIndex: number) => void
  width: number
  height: number
}

function SlidePreview({ element, scale }: { element: CanvasElement; scale: number }) {
  if (element.type === "element") {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: element.svg }}
        style={{
          transform: `translate(${element.x * scale}px, ${element.y * scale}px) rotate(${element.rotation}deg) scale(${element.magn * scale})`,
          position: "absolute",
        }}
      />
    )
  }

  if (element.type === "chart") {
    const chartWidth = element.config.chart.width * scale
    const chartHeight = element.config.chart.height * scale

    if (element.config.chart.type === "line") {
      return (
        <div
          style={{
            transform: `translate(${element.x * scale}px, ${element.y * scale}px) rotate(${element.rotation}deg) scale(${element.magn})`,
            position: "absolute",
          }}
        >
          <LineChart
            width={chartWidth}
            height={chartHeight}
            data={element.config.xAxis?.categories.map((category, index) => ({
              name: category,
              ...element.config.series.reduce(
                (acc, series) => ({
                  ...acc,
                  [series.name]: series.data[index],
                }),
                {},
              ),
            }))}
          >
            {element.config.series.map((series, index) => (
              <Line key={index} type="monotone" dataKey={series.name} stroke={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </LineChart>
        </div>
      )
    }

    if (element.config.chart.type === "pie") {
      return (
        <div
          style={{
            transform: `translate(${element.x * scale}px, ${element.y * scale}px) rotate(${element.rotation}deg) scale(${element.magn})`,
            position: "absolute",
          }}
        >
          <PieChart width={chartWidth} height={chartHeight}>
            <Pie
              data={element.config.series[0].data}
              cx="50%"
              cy="50%"
              innerRadius={
                element.config.plotOptions?.pie?.innerSize
                  ? (Number.parseInt(element.config.plotOptions.pie.innerSize) / 100) * (150 * scale)
                  : 0
              }
              outerRadius={150 * scale}
              dataKey="y"
            >
              {element.config.series[0].data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </div>
      )
    }
  }
}

export function SlidesNav({
  slides,
  currentSlideId,
  onSlideSelect,
  onAddSlide,
  onDeleteSlide,
  onReorderSlides,
  width,
  height,
}: SlidesNavProps) {
  const thumbnailWidth = 160
  const thumbnailHeight = (height * thumbnailWidth) / width
  const scale = thumbnailWidth / width
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", "")
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedIndex === null) return

    const draggedItem = slides[draggedIndex]
    if (!draggedItem) return

    if (draggedIndex !== index) {
      onReorderSlides(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="border-t bg-gray-50 p-4">
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="relative group"
            >
              <div
                onClick={() => onSlideSelect(slide.id)}
                className={cn(
                  "relative group transition-all cursor-pointer overflow-hidden",
                  currentSlideId === slide.id && "ring-2 ring-primary",
                )}
              >
                <div
                  className="bg-white border shadow-sm hover:shadow-md transition-shadow relative"
                  style={{
                    width: `${thumbnailWidth}px`,
                    height: `${thumbnailHeight}px`,
                  }}
                >
                  <div className="absolute inset-0 bg-grid-pattern scale-[0.2] origin-top-left" />
                  {/* Render slide content */}
                  {slide.elements.map((element, elementIndex) => (
                    <SlidePreview key={elementIndex} element={element} scale={scale} />
                  ))}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                {/* Slide number */}
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {index + 1}
                </div>

                {/* Drag handle */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVerticalIcon className="w-4 h-4 text-gray-500 cursor-grab active:cursor-grabbing" />
                </div>

                {/* Delete button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSlideToDelete(slide.id)
                  }}
                >
                  <Trash2Icon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            className="flex-shrink-0"
            style={{
              width: `${thumbnailWidth}px`,
              height: `${thumbnailHeight}px`,
            }}
            onClick={onAddSlide}
          >
            <PlusCircleIcon className="w-6 h-6" />
          </Button>
        </div>
      </ScrollArea>

      <AlertDialog open={!!slideToDelete} onOpenChange={() => setSlideToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this slide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (slideToDelete) {
                  onDeleteSlide(slideToDelete)
                }
                setSlideToDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

