"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Pencil, Type, Eraser, Circle, Undo2, Redo2, Move } from "lucide-react"

interface DrawingControlsProps {
  activeTool: "line" | "text" | "eraser" | "pan" | null
  currentColor: string
  onToolChange: (tool: "line" | "text" | "eraser" | "pan" | null) => void
  onColorChange: (color: string) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

const COLORS = [
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
]

export function DrawingControls({
  activeTool,
  currentColor,
  onToolChange,
  onColorChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DrawingControlsProps) {
  return (
    <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <Button
        variant={activeTool === "line" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange(activeTool === "line" ? null : "line")}
        title="Draw Line"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      <Button
        variant={activeTool === "text" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange(activeTool === "text" ? null : "text")}
        title="Add Text"
      >
        <Type className="h-4 w-4" />
      </Button>

      <Button
        variant={activeTool === "eraser" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange(activeTool === "eraser" ? null : "eraser")}
        title="Eraser"
      >
        <Eraser className="h-4 w-4" />
      </Button>

      <Button
        variant={activeTool === "pan" ? "default" : "outline"}
        size="icon"
        onClick={() => onToolChange(activeTool === "pan" ? null : "pan")}
        title="Pan Canvas"
      >
        <Move className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <Button variant="outline" size="icon" onClick={onUndo} disabled={!canUndo} title="Undo">
        <Undo2 className="h-4 w-4" />
      </Button>

      <Button variant="outline" size="icon" onClick={onRedo} disabled={!canRedo} title="Redo">
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Circle className="h-4 w-4" style={{ color: currentColor }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

