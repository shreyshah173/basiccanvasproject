"use client"

import type { CanvasElement } from "@/types/canvas"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarProps {
  elements: CanvasElement[]
}

export function Sidebar({ elements }: SidebarProps) {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>, element: CanvasElement) => {
    try {
      // Set multiple data formats for better compatibility
      const stringifiedData = JSON.stringify(element)
      e.dataTransfer.setData("application/json", stringifiedData)
      e.dataTransfer.setData("text/plain", stringifiedData)
      e.dataTransfer.effectAllowed = "copy"
    } catch (error) {
      console.error("Error starting drag:", error)
    }
  }

  return (
    <div className="w-64 border-l bg-gray-50">
      <ScrollArea className="h-screen">
        <div className="p-4">
          <h2 className="font-semibold mb-4">Charts</h2>
          <div className="space-y-2">
            {elements.map((element, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                draggable
                onDragStart={(e) => handleDragStart(e, element)}
              >
                {element.name}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

