"use client"

import type { CanvasElement } from "@/types"
import { Button } from "@/components/ui/button"
import { useCallback } from "react"
import type React from "react" // Import React

interface ToolbarProps {
  elements: CanvasElement[]
}

export function Toolbar({ elements }: ToolbarProps) {
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, element: CanvasElement) => {
    try {
      const stringifiedData = JSON.stringify(element)

      // Set multiple data formats for better compatibility
      e.dataTransfer.setData("application/json", stringifiedData)
      e.dataTransfer.setData("text/plain", stringifiedData)

      // Set drag image
      if (element.type === "element") {
        const dragImage = new Image()
        dragImage.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(element.svg)}`
        e.dataTransfer.setDragImage(dragImage, 0, 0)
      }

      e.dataTransfer.effectAllowed = "copy"
    } catch (error) {
      console.error("Error starting drag:", error)
    }
  }, [])

  return (
    <div className="w-64 border-r bg-gray-50 p-4">
      <h2 className="font-semibold mb-4">Elements</h2>
      <div className="space-y-2">
        {elements.map((element, index) => (
          <div key={index} className="cursor-move" draggable onDragStart={(e) => handleDragStart(e, element)}>
            {element.type === "element" ? (
              <div dangerouslySetInnerHTML={{ __html: element.svg }} className="hover:opacity-75 transition-opacity" />
            ) : (
              <Button variant="outline" className="w-full justify-start">
                {element.name}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

