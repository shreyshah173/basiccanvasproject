import { useState } from "react"
import type { CanvasState, DrawingElement, Point } from "@/types"

export function useCanvasState() {
  const [state, setState] = useState<CanvasState>({
    zoom: 1,
    activeTool: null,
    currentColor: "#000000",
    selectedTextElement: null,
    isDrawing: false,
    currentPath: null,
    textInput: null,
  })

  const updateState = (updates: Partial<CanvasState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const setZoom = (zoom: number) => {
    updateState({ zoom })
  }

  const setActiveTool = (tool: CanvasState["activeTool"]) => {
    updateState({ activeTool: tool })
  }

  const setCurrentColor = (color: string) => {
    updateState({ currentColor: color })
  }

  const setSelectedTextElement = (element: DrawingElement | null) => {
    updateState({ selectedTextElement: element })
  }

  const setIsDrawing = (isDrawing: boolean) => {
    updateState({ isDrawing })
  }

  const setCurrentPath = (path: DrawingElement | null) => {
    updateState({ currentPath: path })
  }

  const setTextInput = (point: Point | null) => {
    updateState({ textInput: point })
  }

  return {
    state,
    setZoom,
    setActiveTool,
    setCurrentColor,
    setSelectedTextElement,
    setIsDrawing,
    setCurrentPath,
    setTextInput,
  }
}

