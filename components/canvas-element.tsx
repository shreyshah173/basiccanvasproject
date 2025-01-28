"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import type { CanvasElement } from "@/types/canvas"
import { Rotate3dIcon as RotateIcon, MaximizeIcon, Trash2Icon, PaintbrushIcon } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface CanvasElementProps {
  element: CanvasElement
  canvasWidth: number
  canvasHeight: number
  onMove: (position: { x: number; y: number }) => void
  onUpdate: (updates: Partial<CanvasElement>) => void
  onSelect: () => void
  onDelete: () => void
  isSelected: boolean
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

export function CanvasElement({
  element,
  canvasWidth,
  canvasHeight,
  onMove,
  onUpdate,
  onSelect,
  onDelete,
  isSelected,
}: CanvasElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const isRotating = useRef(false)
  const isScaling = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startAngle = useRef(0)
  const startScale = useRef(1)
  const [isPartiallyOutside, setIsPartiallyOutside] = useState(false)

  const getCenter = useCallback(() => {
    if (!elementRef.current) return { x: 0, y: 0 }
    const rect = elementRef.current.getBoundingClientRect()
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    }
  }, [])

  useEffect(() => {
    const checkBoundaries = () => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const canvas = elementRef.current.parentElement?.getBoundingClientRect()

      if (canvas) {
        const isOutside =
          rect.left < canvas.left - rect.width ||
          rect.right > canvas.right + rect.width ||
          rect.top < canvas.top - rect.height ||
          rect.bottom > canvas.bottom + rect.height

        setIsPartiallyOutside(isOutside)
      }
    }

    const observer = new ResizeObserver(checkBoundaries)
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    isDragging.current = true
    startPos.current = {
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    }
    onSelect()
  }

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    isRotating.current = true
    const center = getCenter()
    startAngle.current = Math.atan2(e.clientY - center.y, e.clientX - center.x) - (element.rotation * Math.PI) / 180
  }

  const handleScaleStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    isScaling.current = true
    const center = getCenter()
    startScale.current = element.magn
    startPos.current = {
      x: e.clientX - center.x,
      y: e.clientY - center.y,
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const x = Math.min(Math.max(0, e.clientX - startPos.current.x), canvasWidth)
        const y = Math.min(Math.max(0, e.clientY - startPos.current.y), canvasHeight)
        onMove({ x, y })
      }

      if (isRotating.current) {
        const center = getCenter()
        const angle = Math.atan2(e.clientY - center.y, e.clientX - center.x)
        const newRotation = ((angle - startAngle.current) * 180) / Math.PI
        onUpdate({ rotation: newRotation })
      }

      if (isScaling.current) {
        const center = getCenter()
        const currentDistance = Math.hypot(e.clientX - center.x, e.clientY - center.y)
        const startDistance = Math.hypot(startPos.current.x, startPos.current.y)
        const scale = (currentDistance / startDistance) * startScale.current
        onUpdate({ magn: Math.min(Math.max(0.5, scale), 2) })
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
      isRotating.current = false
      isScaling.current = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [canvasHeight, canvasWidth, onMove, onUpdate, getCenter])

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

  const renderElement = () => {
    if (element.type === "element") {
      return <div dangerouslySetInnerHTML={{ __html: element.svg }} className="select-none" />
    }

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
                {element.config.series[0].data.map((entry, index) => (
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
  }

  const renderControls = () => {
    if (!isSelected) return null

    return (
      <div ref={controlsRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <div
            className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-800 rounded-full cursor-pointer pointer-events-auto hover:bg-gray-50 shadow-md"
            onMouseDown={handleRotateStart}
          >
            <RotateIcon className="w-4 h-4" />
          </div>

          {element.type === "element" && (
            <Popover>
              <PopoverTrigger asChild>
                <div className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-800 rounded-full cursor-pointer pointer-events-auto hover:bg-gray-50 shadow-md">
                  <PaintbrushIcon className="w-4 h-4" />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid grid-cols-6 gap-2 p-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <Button
            size="icon"
            variant="outline"
            className="w-8 h-8 rounded-full pointer-events-auto bg-white hover:bg-red-50 border border-red-200 text-red-500"
            onClick={onDelete}
          >
            <Trash2Icon className="w-4 h-4" />
          </Button>
        </div>

        <div
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-800 rounded-full cursor-pointer pointer-events-auto hover:bg-gray-50 shadow-md"
          onMouseDown={handleScaleStart}
        >
          <MaximizeIcon className="w-4 h-4" />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${
        isSelected ? "ring-2 ring-primary ring-offset-2" : ""
      } ${isPartiallyOutside ? "opacity-50 blur-[2px]" : ""}`}
      style={{
        transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg) scale(${element.magn})`,
        transformOrigin: "center",
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      {renderControls()}
    </div>
  )
}

