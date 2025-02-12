"use client"

import { useRef, useState, useEffect } from "react"
import type { DrawingElement } from "@/types"
import { TextControls } from "@/components/text-controls"

interface TextElementProps {
  element: DrawingElement
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<DrawingElement>) => void
  onDelete: () => void
  scale: number
}

export function TextElement({ element, isSelected, onSelect, onUpdate, onDelete, scale }: TextElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: element.x || 0, y: element.y || 0 })

  useEffect(() => {
    setPosition({ x: element.x || 0, y: element.y || 0 })
  }, [element.x, element.y])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
    onSelect()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    onUpdate({ x: position.x, y: position.y })
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp]) // Removed dragStart from dependencies

  if (element.type !== "text") return null

  return (
    <div
      ref={elementRef}
      className={`absolute min-w-[100px] min-h-[24px] ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isEditing ? "text" : "move",
        transform: `scale(${element.magn || 1})`,
        transformOrigin: "top left",
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <div
        contentEditable={true}
        suppressContentEditableWarning
        className="outline-none whitespace-pre-wrap break-words px-1 py-0.5 rounded hover:bg-gray-50/50"
        style={{
          color: element.color,
          fontSize: element.fontSize,
          fontFamily: element.fontFamily,
          textAlign: element.textAlign as any,
        }}
        onFocus={() => setIsEditing(true)}
        onBlur={(e) => {
          setIsEditing(false)
          onUpdate({ text: e.currentTarget.textContent || "" })
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
      >
        {element.text || "Click to edit text"}
      </div>

      {isSelected && !isEditing && (
        <div className="absolute -top-12 left-0 z-10">
          <TextControls
            fontSize={element.fontSize || 16}
            fontFamily={element.fontFamily || "Arial"}
            color={element.color}
            magnification={element.magn || 1}
            onFontSizeChange={(size) => onUpdate({ fontSize: size })}
            onFontFamilyChange={(family) => onUpdate({ fontFamily: family })}
            onColorChange={(color) => onUpdate({ color })}
            onMagnificationChange={(magn) => onUpdate({ magn })}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  )
}

