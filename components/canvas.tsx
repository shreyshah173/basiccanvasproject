"use client"

import { useRef, useState } from "react"
import type { CanvasElement } from "@/types/canvas"
import type { Slide } from "@/types/presentation"
import { CanvasElement as CanvasElementComponent } from "./canvas-element"
import { ZoomControls } from "./zoom-controls"

interface CanvasProps {
  slide: Slide
  width: number
  height: number
  onUpdate: (slideId: string, updates: Partial<Slide>) => void
}

export function Canvas({ slide, width, height, onUpdate }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    try {
      const data = e.dataTransfer.getData("text/plain")
      if (!data) return

      const elementData = JSON.parse(data)
      const canvasRect = canvasRef.current?.getBoundingClientRect()
      if (!canvasRect) return

      // Adjust for zoom level when calculating position
      const x = (e.clientX - canvasRect.left) / zoom
      const y = (e.clientY - canvasRect.top) / zoom

      const newElement: CanvasElement = {
        ...elementData,
        x,
        y,
        magn: 1,
        rotation: 0,
      }

      onUpdate(slide.id, {
        elements: [...slide.elements, newElement],
        selectedElementIndex: slide.elements.length,
      })
    } catch (error) {
      console.error("Failed to process dropped element:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleElementMove = (index: number, newPosition: { x: number; y: number }) => {
    const newElements = slide.elements.map((element, i) => (i === index ? { ...element, ...newPosition } : element))
    onUpdate(slide.id, { elements: newElements })
  }

  const handleElementUpdate = (index: number, updates: Partial<CanvasElement>) => {
    const newElements = slide.elements.map((element, i) => (i === index ? { ...element, ...updates } : element))
    onUpdate(slide.id, { elements: newElements })
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === canvasRef.current) {
      onUpdate(slide.id, { selectedElementIndex: null })
    }
  }

  const handleElementSelect = (index: number) => {
    onUpdate(slide.id, { selectedElementIndex: index })
  }

  const handleElementDelete = (index: number) => {
    const newElements = slide.elements.filter((_, i) => i !== index)
    onUpdate(slide.id, {
      elements: newElements,
      selectedElementIndex: null,
    })
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto bg-gray-100">
      <div
        ref={canvasRef}
        className="relative bg-grid-pattern border-2 border-gray-200 mx-auto origin-center transition-transform duration-200"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `scale(${zoom})`,
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleCanvasClick}
      >
        {slide.elements.map((element, index) => (
          <CanvasElementComponent
            key={index}
            element={element}
            canvasWidth={width}
            canvasHeight={height}
            onMove={(position) => handleElementMove(index, position)}
            onUpdate={(updates) => handleElementUpdate(index, updates)}
            onSelect={() => handleElementSelect(index)}
            onDelete={() => handleElementDelete(index)}
            isSelected={index === slide.selectedElementIndex}
          />
        ))}
      </div>
      <ZoomControls zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onResetZoom={handleResetZoom} />
    </div>
  )
}

