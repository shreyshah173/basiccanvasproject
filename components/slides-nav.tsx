"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { PlusCircleIcon, Trash2Icon, GripVerticalIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import type { Slide } from "@/types"
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
import { useState, useRef } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts"

interface SlidesNavProps {
  slides: Slide[]
  currentSlideId: string
  onSlideSelect: (slideId: string) => void
  onAddSlide: () => void
  onDeleteSlide: (slideId: string) => void
  onReorderSlides: (draggedIndex: number, targetIndex: number) => void
  width: number
  height: number
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
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Fixed dimensions for thumbnails
  const THUMBNAIL_WIDTH = 160
  const THUMBNAIL_HEIGHT = 90 // 16:9 aspect ratio

  // Calculate scale to fit content within thumbnail
  const scaleX = THUMBNAIL_WIDTH / width
  const scaleY = THUMBNAIL_HEIGHT / height
  const scale = Math.min(scaleX, scaleY)

  // Calculate centered position within thumbnail
  const scaledWidth = width * scale
  const scaledHeight = height * scale
  const offsetX = (THUMBNAIL_WIDTH - scaledWidth) / 2
  const offsetY = (THUMBNAIL_HEIGHT - scaledHeight) / 2

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", "") // Required for Firefox
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    onReorderSlides(draggedIndex, index)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return

    const scrollAmount = THUMBNAIL_WIDTH + 16 // thumbnail width + gap
    const currentScroll = scrollContainerRef.current.scrollLeft
    const newScroll = direction === "left" ? currentScroll - scrollAmount : currentScroll + scrollAmount

    scrollContainerRef.current.scrollTo({
      left: newScroll,
      behavior: "smooth",
    })
  }

  const renderChart = (element: any) => {
    if (element.type === "chart") {
      if (element.config.chart.type === "line") {
        return (
          <LineChart
            width={element.config.chart.width * scale}
            height={element.config.chart.height * scale}
            data={element.config.xAxis?.categories.map((category: string, index: number) => ({
              name: category,
              ...element.config.series.reduce(
                (acc: any, series: any) => ({
                  ...acc,
                  [series.name]: series.data[index],
                }),
                {},
              ),
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            {element.config.series.map((series: any, index: number) => (
              <Line key={index} type="monotone" dataKey={series.name} stroke={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </LineChart>
        )
      }

      if (element.config.chart.type === "pie") {
        return (
          <div className="relative">
            <PieChart width={element.config.chart.width * scale} height={element.config.chart.height * scale}>
              <Pie
                data={element.config.series[0].data}
                cx="50%"
                cy="50%"
                innerRadius={
                  element.config.plotOptions?.pie?.innerSize
                    ? (Number.parseInt(element.config.plotOptions.pie.innerSize) / 100) * 150 * scale
                    : 0
                }
                outerRadius={150 * scale}
                dataKey="y"
              >
                {element.config.series[0].data.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            {element.centerText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-lg font-medium" style={{ transform: `scale(${scale})` }}>
                  {element.centerText}
                </span>
              </div>
            )}
          </div>
        )
      }
    }
    return null
  }

  return (
    <div className="border-t bg-gray-50 p-4">
      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        <ScrollArea className="w-full">
          <div className="flex gap-4 px-10">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className="relative group flex-shrink-0"
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
                      width: `${THUMBNAIL_WIDTH}px`,
                      height: `${THUMBNAIL_HEIGHT}px`,
                    }}
                  >
                    {/* Background grid */}
                    <div className="absolute inset-0 bg-grid-pattern scale-[0.2] origin-top-left" />

                    {/* Content container with proper scaling and centering */}
                    <div
                      className="absolute"
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                        left: `${offsetX}px`,
                        top: `${offsetY}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                      }}
                    >
                      {/* Render slide elements */}
                      {slide.elements?.map((element, elementIndex) => (
                        <div
                          key={elementIndex}
                          style={{
                            position: "absolute",
                            left: `${element.x}px`,
                            top: `${element.y}px`,
                            transform: `rotate(${element.rotation}deg) scale(${element.magn})`,
                          }}
                        >
                          {element.type === "element" && <div dangerouslySetInnerHTML={{ __html: element.svg }} />}
                          {element.type === "chart" && renderChart(element)}
                        </div>
                      ))}

                      {/* Render drawing elements */}
                      {slide.drawingElements?.length > 0 && (
                        <svg
                          className="absolute inset-0 pointer-events-none"
                          width={width}
                          height={height}
                          viewBox={`0 0 ${width} ${height}`}
                        >
                          {slide.drawingElements.map((element) => {
                            if (element.type === "line" && element.points) {
                              const pathData = element.points
                                .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
                                .join(" ")
                              return (
                                <path
                                  key={element.id}
                                  d={pathData}
                                  stroke={element.color}
                                  strokeWidth={2}
                                  fill="none"
                                />
                              )
                            }
                            return null
                          })}
                        </svg>
                      )}

                      {/* Render text elements */}
                      {slide.drawingElements?.map((element) => {
                        if (element.type === "text") {
                          return (
                            <div
                              key={element.id}
                              style={{
                                position: "absolute",
                                left: `${element.x}px`,
                                top: `${element.y}px`,
                                color: element.color,
                                fontSize: `${element.fontSize}px`,
                                fontFamily: element.fontFamily,
                                textAlign: element.textAlign as any,
                              }}
                            >
                              {element.text}
                            </div>
                          )
                        }
                        return null
                      })}
                    </div>
                  </div>

                  {/* Overlay effects */}
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

            {/* Add slide button */}
            <Button
              variant="outline"
              className="flex-shrink-0"
              style={{
                width: `${THUMBNAIL_WIDTH}px`,
                height: `${THUMBNAIL_HEIGHT}px`,
              }}
              onClick={onAddSlide}
            >
              <PlusCircleIcon className="w-6 h-6" />
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          onClick={() => handleScroll("right")}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation dialog */}
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

