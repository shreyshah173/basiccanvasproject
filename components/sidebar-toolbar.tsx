"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarToolbarProps {
  elements: any[]
}

export function SidebarToolbar({ elements }: SidebarToolbarProps) {
  const handleDragStart = (e: React.DragEvent, element: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(element))
  }

  return (
    <ScrollArea className="h-screen w-64 border-l">
      <div className="p-4 space-y-2">
        <h2 className="font-semibold mb-4">Charts</h2>
        {elements
          .filter((element) => element.type === "chart")
          .map((element, index) => (
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
    </ScrollArea>
  )
}

