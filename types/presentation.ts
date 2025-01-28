import type { CanvasElement } from "./canvas"

export interface Slide {
  id: string
  elements: CanvasElement[]
  selectedElementIndex: number | null
}

