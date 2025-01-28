"use client"

import type { CanvasElement } from "@/types/canvas"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ControlsPanelProps {
  selectedElement: CanvasElement | null
  onUpdate: (updates: Partial<CanvasElement>) => void
}

export function ControlsPanel({ selectedElement, onUpdate }: ControlsPanelProps) {
  if (!selectedElement) return null

  const handleColorChange = (color: string) => {
    if (selectedElement.type === "element") {
      const parser = new DOMParser()
      const doc = parser.parseFromString(selectedElement.svg, "image/svg+xml")
      const rect = doc.querySelector("rect")
      if (rect) {
        rect.setAttribute("fill", color)
        onUpdate({ svg: doc.documentElement.outerHTML })
      }
    }
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 flex gap-4 items-end">
      <div className="space-y-2">
        <Label>Magnification</Label>
        <Slider
          value={[selectedElement.magn * 100]}
          onValueChange={(value) => onUpdate({ magn: value[0] / 100 })}
          min={50}
          max={200}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Rotation (degrees)</Label>
        <Slider
          value={[selectedElement.rotation]}
          onValueChange={(value) => onUpdate({ rotation: value[0] })}
          min={0}
          max={360}
          step={1}
        />
      </div>

      {selectedElement.type === "element" && (
        <div className="space-y-2">
          <Label>Color</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[80px] h-[30px]"
                style={{
                  backgroundColor: selectedElement.svg.match(/fill='([^']+)'/)?.[1] || "#000000",
                }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-[280px]">
              <div className="grid grid-cols-7 gap-2">
                {[
                  "#000000",
                  "#FF0000",
                  "#00FF00",
                  "#0000FF",
                  "#FFFF00",
                  "#FF00FF",
                  "#00FFFF",
                  "#808080",
                  "#800000",
                  "#008000",
                  "#000080",
                  "#808000",
                  "#800080",
                  "#008080",
                ].map((color) => (
                  <Button
                    key={color}
                    variant="outline"
                    className="w-8 h-8 rounded-md p-0"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  )
}

