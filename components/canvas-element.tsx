"use client"

import React, { useRef, useState } from "react"
import type { CanvasElement as CanvasElementType } from "@/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { RotateCw, Maximize, PaintbrushIcon as PaintBrush, Trash2Icon } from "lucide-react"

interface CanvasElementProps {
  element: CanvasElementType
  isSelected: boolean
  onSelect: () => void
  onMove: (position: { x: number; y: number }) => void
  onUpdate: (updates: Partial<CanvasElementType>) => void
  onDelete: () => void
}

const COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#008000",
  "#000080",
  "#800000",
  "#808000",
]

export function CanvasElement({ element, isSelected, onSelect, onMove, onUpdate, onDelete }: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [startAngle, setStartAngle] = useState(0)
  const [startScale, setStartScale] = useState(1)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.button !== 0) return // Only handle left click
    setIsDragging(true)
    setStartPos({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    })
    onSelect()
  }

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsRotating(true)
    const rect = elementRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    setStartAngle(Math.atan2(e.clientY - centerY, e.clientX - centerX) - (element.rotation * Math.PI) / 180)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setStartPos({ x: e.clientX, y: e.clientY })
    setStartScale(element.magn)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      })
    }

    if (isRotating) {
      const rect = elementRef.current?.getBoundingClientRect()
      if (!rect) return

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      const newRotation = ((angle - startAngle) * 180) / Math.PI
      onUpdate({ rotation: newRotation })
    }

    if (isResizing) {
      const dx = e.clientX - startPos.x
      const dy = e.clientY - startPos.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const scale = Math.max(0.1, startScale + distance * 0.01 * (dx > 0 ? 1 : -1))
      onUpdate({ magn: scale })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsRotating(false)
    setIsResizing(false)
  }

  React.useEffect(() => {
    if (isDragging || isRotating || isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, isRotating, isResizing, handleMouseMove]) // Added handleMouseMove to dependencies

  const handleColorChange = (color: string) => {
    if (element.type === "element") {
      const parser = new DOMParser()
      const doc = parser.parseFromString(element.svg, "image/svg+xml")
      const shape = doc.querySelector("rect, circle, path")
      if (shape) {
        shape.setAttribute("fill", color)
        onUpdate({ svg: doc.documentElement.outerHTML })
      }
    }
  }

  const renderChart = () => {
    if (element.type === "chart") {
      if (element.config.chart.type === "line") {
        return (
          <LineChart
            width={element.config.chart.width}
            height={element.config.chart.height}
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            {element.config.series.map((series, index) => (
              <Line key={index} type="monotone" dataKey={series.name} stroke={`hsl(${index * 60}, 70%, 50%)`} />
            ))}
          </LineChart>
        )
      }

      if (element.config.chart.type === "pie") {
        return (
          <div className="relative">
            <PieChart width={element.config.chart.width} height={element.config.chart.height}>
              <Pie
                data={element.config.series[0].data}
                cx="50%"
                cy="50%"
                innerRadius={
                  element.config.plotOptions?.pie?.innerSize
                    ? (Number.parseInt(element.config.plotOptions.pie.innerSize) / 100) * 150
                    : 0
                }
                outerRadius={150}
                dataKey="y"
              >
                {element.config.series[0].data.map((entry: any, index: number) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
            {element.centerText && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-lg font-medium">{element.centerText}</span>
              </div>
            )}
          </div>
        )
      }
    }

    if (element.type === "element") {
      return <div dangerouslySetInnerHTML={{ __html: element.svg }} />
    }
  }

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
      style={{
        transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg) scale(${element.magn})`,
        transformOrigin: "center",
      }}
      onMouseDown={handleMouseDown}
    >
      {renderChart()}

      {/* Controls overlay when selected */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Rotation control */}
          <Button
            size="icon"
            variant="outline"
            className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full pointer-events-auto"
            onMouseDown={handleRotateStart}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          {/* Delete control */}
          <Button
            size="icon"
            variant="outline"
            className="absolute -top-8 -right-8 w-8 h-8 rounded-full pointer-events-auto hover:bg-destructive hover:text-destructive-foreground"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>

          {/* Resize control */}
          <Button
            size="icon"
            variant="outline"
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full pointer-events-auto"
            onMouseDown={handleResizeStart}
          >
            <Maximize className="h-4 w-4" />
          </Button>

          {/* Color picker for SVG elements */}
          {element.type === "element" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute -top-8 -right-8 w-8 h-8 rounded-full pointer-events-auto"
                >
                  <PaintBrush className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  )
}

