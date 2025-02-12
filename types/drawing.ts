export interface DrawingElement {
  id: string
  type: "line" | "text"
  points?: { x: number; y: number }[]
  text?: string
  color: string
  x?: number
  y?: number
  fontSize?: number
  fontFamily?: string
  textAlign?: "left" | "center" | "right"
  isDragging?: boolean
}

