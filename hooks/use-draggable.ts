import { useEffect, useRef } from "react"

interface DraggableOptions {
  onDragEnd?: (position: { x: number; y: number }) => void
}

export function useDraggable(elementRef: React.RefObject<HTMLElement>, options: DraggableOptions = {}) {
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const currentPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true
      startPos.current = {
        x: e.clientX - currentPos.current.x,
        y: e.clientY - currentPos.current.y,
      }
      element.style.cursor = "grabbing"
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return

      const x = e.clientX - startPos.current.x
      const y = e.clientY - startPos.current.y

      element.style.transform = `translate(${x}px, ${y}px)`
      currentPos.current = { x, y }
    }

    const handleMouseUp = () => {
      if (!isDragging.current) return

      isDragging.current = false
      element.style.cursor = "grab"
      options.onDragEnd?.(currentPos.current)
    }

    element.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      element.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [elementRef, options])
}

