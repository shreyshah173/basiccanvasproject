"use client"

import type { CanvasElement } from "@/types/canvas"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
  elements: CanvasElement[]
}

export function Toolbar({ elements }: ToolbarProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, element: CanvasElement) => {
    const stringifiedData = JSON.stringify(element)
    e.dataTransfer.setData("text/plain", stringifiedData)
    e.dataTransfer.effectAllowed = "copy"
  }

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

