import type { CanvasElement } from "./canvas"
import type { DrawingElement } from "./drawing"

export interface Slide {
  id: string
  elements: CanvasElement[]
  drawingElements: DrawingElement[]
  selectedElementIndex: number | null
}

export interface SlideHistory {
  past: Slide[][]
  present: Slide[]
  future: Slide[][]
}

