import { useState, useCallback } from "react"
import type { Point, DrawingElement } from "@/types"
import { nanoid } from "nanoid"

interface DrawingState {
  isDrawing: boolean
  currentPath: DrawingElement | null
  currentTool: "line" | "text" | "eraser" | null
  currentColor: string
}

export function useDrawingState() {
  const [state, setState] = useState<DrawingState>({
    isDrawing: false,
    currentPath: null,
    currentTool: null,
    currentColor: "#000000",
  })

  const startDrawing = useCallback((point: Point, color: string) => {
    setState((prev) => ({
      ...prev,
      isDrawing: true,
      currentPath: {
        id: nanoid(),
        type: "line",
        points: [point],
        color: color,
      },
    }))
  }, [])

  const continueDrawing = useCallback((point: Point) => {
    setState((prev) => {
      if (!prev.currentPath || !prev.isDrawing) return prev

      return {
        ...prev,
        currentPath: {
          ...prev.currentPath,
          points: [...(prev.currentPath.points || []), point],
        },
      }
    })
  }, [])

  const endDrawing = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDrawing: false,
    }))
  }, [])

  const setTool = useCallback((tool: DrawingState["currentTool"]) => {
    setState((prev) => ({
      ...prev,
      currentTool: tool,
    }))
  }, [])

  const setColor = useCallback((color: string) => {
    setState((prev) => ({
      ...prev,
      currentColor: color,
    }))
  }, [])

  return {
    state,
    startDrawing,
    continueDrawing,
    endDrawing,
    setTool,
    setColor,
  }
}

