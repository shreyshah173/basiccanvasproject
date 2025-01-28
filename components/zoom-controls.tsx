"use client"

import { Minus, Plus, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ZoomControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onResetZoom }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg">
      <Button variant="outline" size="icon" onClick={onZoomOut}>
        <Minus className="h-4 w-4" />
      </Button>
      <div className="w-16 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</div>
      <Button variant="outline" size="icon" onClick={onZoomIn}>
        <Plus className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onResetZoom}>
        <RotateCcw className="h-4 w-4" />
      </Button>
    </div>
  )
}

