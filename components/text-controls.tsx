"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Circle, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

interface TextControlsProps {
  fontSize: number
  fontFamily: string
  color: string
  magnification: number
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onColorChange: (color: string) => void
  onMagnificationChange: (magn: number) => void
  onDelete: () => void
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

const FONT_FAMILIES = ["Arial", "Times New Roman", "Courier New", "Georgia", "Verdana", "Helvetica"]

export function TextControls({
  fontSize,
  fontFamily,
  color,
  magnification,
  onFontSizeChange,
  onFontFamilyChange,
  onColorChange,
  onMagnificationChange,
  onDelete,
}: TextControlsProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm border">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="w-8 h-8">
            <Circle className="w-4 h-4" style={{ color }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                style={{ backgroundColor: c }}
                onClick={() => onColorChange(c)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Font Size</Label>
        <Slider
          value={[fontSize]}
          onValueChange={(value) => onFontSizeChange(value[0])}
          min={8}
          max={72}
          step={1}
          className="w-32"
        />
      </div>

      <Separator orientation="vertical" className="h-8" />

      <Select value={fontFamily} onValueChange={onFontFamilyChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONT_FAMILIES.map((font) => (
            <SelectItem key={font} value={font}>
              <span style={{ fontFamily: font }}>{font}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-8" />

      <div className="flex flex-col gap-1">
        <Label className="text-xs">Size</Label>
        <Slider
          value={[magnification * 100]}
          onValueChange={(value) => onMagnificationChange(value[0] / 100)}
          min={50}
          max={200}
          step={1}
          className="w-32"
        />
      </div>

      <Separator orientation="vertical" className="h-8" />

      <Button
        variant="outline"
        size="icon"
        className="w-8 h-8 hover:bg-destructive hover:text-destructive-foreground"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

