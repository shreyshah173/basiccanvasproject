import { nanoid } from "nanoid"
import type { Slide } from "@/types/presentation"

export function createInitialSlide(): Slide {
  return {
    id: nanoid(),
    elements: [],
    drawingElements: [],
    selectedElementIndex: null,
  }
}

