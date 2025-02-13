"use client"

import { useRef, useEffect, useState } from "react"
import { nanoid } from "nanoid"
import type { CanvasElement, DrawingElement, Point, Slide } from "@/types"
import { useCanvasState } from "@/hooks/use-canvas-state"
import { useHistory } from "@/hooks/use-history"
import { CanvasElement as CanvasElementComponent } from "./canvas-element"
import { DrawingControls } from "./drawing-controls"
import { ZoomControls } from "./zoom-controls"
import { TextElement } from "./text-element"

interface CanvasProps {
  slide: Slide
  width: number
  height: number
  onUpdate: (slideId: string, updates: Partial<Slide>) => void
}

export function Canvas({ slide, width, height, onUpdate }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({
    x: typeof window !== "undefined" ? (window.innerWidth - width) / 2 : 0,
    y: typeof window !== "undefined" ? (window.innerHeight - height) / 2 : 0,
  })
  const [isPanning, setIsPanning] = useState(false)
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const {
    state,
    setZoom,
    setActiveTool,
    setCurrentColor,
    setSelectedTextElement,
    setIsDrawing,
    setCurrentPath,
    setTextInput,
  } = useCanvasState()

  // Handle panning with left mouse button when pan tool is active and middle mouse button
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && state.activeTool === "pan") {
      // Left mouse button and pan tool active
      setIsPanning(true)
      lastMousePos.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    } else if (e.button === 1) {
      // Middle mouse button always enables panning
      setIsPanning(true)
      lastMousePos.current = { x: e.clientX, y: e.clientY }
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x
      const dy = e.clientY - lastMousePos.current.y
      setPan((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }))
      lastMousePos.current = { x: e.clientX, y: e.clientY }
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Handle wheel zoom
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = -e.deltaY
      const zoomFactor = 1.1
      const newZoom = delta > 0 ? state.zoom * zoomFactor : state.zoom / zoomFactor
      setZoom(newZoom) // Remove min/max limits
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
    }
  }, []) // Removed handleWheel from dependencies

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPan({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      })
    }
  }, [width, height])

  // Convert client coordinates to canvas coordinates
  const getCanvasPoint = (clientX: number, clientY: number): Point => {
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (!canvasRect) return { x: 0, y: 0 }

    // Calculate the actual position relative to the transformed canvas
    const x = (clientX - canvasRect.left) / (scale * state.zoom)
    const y = (clientY - canvasRect.top) / (scale * state.zoom)

    return { x, y }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()

    try {
      let elementData: CanvasElement | null = null

      try {
        const jsonData = e.dataTransfer.getData("application/json")
        if (jsonData) {
          elementData = JSON.parse(jsonData)
        }
      } catch (err) {
        console.warn("Failed to parse JSON data:", err)
      }

      if (!elementData) {
        const textData = e.dataTransfer.getData("text/plain")
        if (textData) {
          elementData = JSON.parse(textData)
        }
      }

      if (!elementData || !elementData.type || !elementData.name) {
        throw new Error("Invalid element data structure")
      }

      const point = getCanvasPoint(e.clientX, e.clientY)

      const newElement: CanvasElement = {
        ...elementData,
        x: point.x,
        y: point.y,
        magn: 1,
        rotation: 0,
      }

      onUpdate(slide.id, {
        elements: [...(slide.elements || []), newElement],
      })
      setSelectedElementIndex((slide.elements || []).length)
    } catch (error) {
      console.error("Failed to process dropped element:", error)
    }
  }

  const handleDrawingMouseDown = (e: React.MouseEvent) => {
    if (!state.activeTool || e.button !== 0) return // Only handle left click for drawing

    // Clear any selected text when starting a new drawing action
    setSelectedTextElement(null)

    const point = getCanvasPoint(e.clientX, e.clientY)

    if (state.activeTool === "eraser") {
      handleErase(e)
      setIsDrawing(true)
      return
    }

    if (state.activeTool === "text") {
      const newTextElement: DrawingElement = {
        id: nanoid(),
        type: "text",
        text: "Double click to edit text",
        color: state.currentColor,
        x: point.x,
        y: point.y,
        fontSize: 16,
        fontFamily: "Arial",
        textAlign: "left",
        magn: 1,
      }
      const newDrawingElements = [...(slide.drawingElements || []), newTextElement]
      onUpdate(slide.id, { drawingElements: newDrawingElements })
      setSelectedTextElement(newTextElement)
      setActiveTool(null)
      return
    }

    if (state.activeTool === "line") {
      setIsDrawing(true)
      const newPath: DrawingElement = {
        id: nanoid(),
        type: "line",
        points: [point],
        color: state.currentColor,
      }
      setCurrentPath(newPath)
    }
  }

  const handleDrawingMouseMove = (e: React.MouseEvent) => {
    if (!state.isDrawing) return

    if (state.activeTool === "eraser") {
      handleErase(e)
      return
    }

    if (state.activeTool === "line" && state.currentPath) {
      const point = getCanvasPoint(e.clientX, e.clientY)
      setCurrentPath({
        ...state.currentPath,
        points: [...(state.currentPath.points || []), point],
      })
    }
  }

  const handleDrawingMouseUp = () => {
    if (state.currentPath && state.isDrawing && state.activeTool === "line") {
      const newDrawingElements = [...(slide.drawingElements || []), state.currentPath]
      onUpdate(slide.id, { drawingElements: newDrawingElements })
      setCurrentPath(null)
    }
    setIsDrawing(false)
  }

  // Function to handle eraser interaction
  const handleErase = (e: React.MouseEvent) => {
    if (state.activeTool !== "eraser") return

    const point = getCanvasPoint(e.clientX, e.clientY)
    const eraserRadius = 10 // Adjust this value to change eraser size

    const newDrawingElements = slide.drawingElements?.filter((element) => {
      if (element.type !== "line" || !element.points) return true

      return !element.points.some((linePoint) => {
        const dx = linePoint.x - point.x
        const dy = linePoint.y - point.y
        return Math.sqrt(dx * dx + dy * dy) < eraserRadius
      })
    })

    if (newDrawingElements?.length !== slide.drawingElements?.length) {
      onUpdate(slide.id, { drawingElements: newDrawingElements })
    }
  }

  const handleElementUpdate = (index: number, updates: Partial<CanvasElement>) => {
    const newElements = [...(slide.elements || [])]
    newElements[index] = { ...newElements[index], ...updates }
    onUpdate(slide.id, { elements: newElements })
  }

  const { history, canUndo, canRedo, undo, redo, update } = useHistory([slide])

  const handleUndo = () => {
    const previousState = undo()
    if (previousState) {
      onUpdate(slide.id, previousState)
    }
  }

  const handleRedo = () => {
    const nextState = redo()
    if (nextState) {
      onUpdate(slide.id, nextState)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-auto bg-gray-100"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: isPanning ? "grabbing" : "default",
        minWidth: "100vw",
        minHeight: "100vh",
      }}
    >
      <div
        ref={canvasRef}
        className="absolute origin-top-left bg-white border-2 border-gray-200 shadow-lg"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale * state.zoom})`,
          cursor:
            state.activeTool === "pan"
              ? isPanning
                ? "grabbing"
                : "grab"
              : state.activeTool === "line"
                ? "crosshair"
                : "default",
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onMouseDown={handleDrawingMouseDown}
        onMouseMove={handleDrawingMouseMove}
        onMouseUp={handleDrawingMouseUp}
        onMouseLeave={handleDrawingMouseUp}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSelectedElementIndex(null)
            setSelectedTextElement(null) // Clear text selection when clicking canvas
          }
        }}
      >
        {/* Regular elements */}
        {slide.elements?.map((element, index) => (
          <CanvasElementComponent
            key={`${element.name}-${index}`}
            element={element}
            isSelected={index === selectedElementIndex}
            onSelect={() => setSelectedElementIndex(index)}
            onMove={(position) => handleElementUpdate(index, position)}
            onUpdate={(updates) => handleElementUpdate(index, updates)}
            onDelete={() => {
              const newElements = [...(slide.elements || [])]
              newElements.splice(index, 1)
              onUpdate(slide.id, { elements: newElements })
              setSelectedElementIndex(null)
            }}
          />
        ))}

        {/* Drawing elements */}
        <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
          {slide.drawingElements?.map((element) => {
            if (element.type === "line" && element.points) {
              const pathData = element.points
                .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
                .join(" ")
              return <path key={element.id} d={pathData} stroke={element.color} strokeWidth={2} fill="none" />
            }
            return null
          })}
          {state.currentPath?.points && (
            <path
              d={state.currentPath.points
                .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
                .join(" ")}
              stroke={state.currentPath.color}
              strokeWidth={2}
              fill="none"
            />
          )}
        </svg>

        {/* Text elements */}
        {slide.drawingElements?.map((element) => {
          if (element.type === "text") {
            return (
              <TextElement
                key={element.id}
                element={element}
                isSelected={state.selectedTextElement?.id === element.id}
                onSelect={() => setSelectedTextElement(element)}
                onUpdate={(updates) => {
                  const newElements = [...(slide.drawingElements || [])]
                  const index = newElements.findIndex((el) => el.id === element.id)
                  if (index === -1) return
                  newElements[index] = { ...newElements[index], ...updates }
                  onUpdate(slide.id, { drawingElements: newElements })
                }}
                onDelete={() => {
                  const newElements = slide.drawingElements?.filter((el) => el.id !== element.id) || []
                  onUpdate(slide.id, { drawingElements: newElements })
                  setSelectedTextElement(null)
                }}
                scale={scale * state.zoom}
              />
            )
          }
          return null
        })}
      </div>

      {/* Fixed position controls */}
      <div className="fixed left-4 top-4 z-50">
        <DrawingControls
          onToolChange={setActiveTool}
          onColorChange={setCurrentColor}
          activeTool={state.activeTool}
          currentColor={state.currentColor}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      <ZoomControls
        zoom={state.zoom}
        onZoomIn={() => setZoom(state.zoom * 1.2)}
        onZoomOut={() => setZoom(state.zoom / 1.2)}
        onResetZoom={() => {
          setZoom(1)
          setPan({ x: 0, y: 0 })
        }}
      />
    </div>
  )
}

