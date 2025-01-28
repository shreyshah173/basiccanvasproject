"use client"

import { Button } from "@/components/ui/button"

interface HeaderToolbarProps {
  elements: any[]
}

export function HeaderToolbar({ elements }: HeaderToolbarProps) {
  const handleDragStart = (e: React.DragEvent, element: any) => {
    e.dataTransfer.setData("application/json", JSON.stringify(element))
  }

  return (
    <div className="flex items-center gap-2 p-4 border-b">
      {elements
        .filter((element) => element.type === "element")
        .map((element, index) => (
          <Button key={index} variant="outline" draggable onDragStart={(e) => handleDragStart(e, element)}>
            {element.name}
          </Button>
        ))}
    </div>
  )
}

