export interface Point {
  x: number
  y: number
}

export interface ChartConfig {
  type: "chart"
  name: string
  x: number
  y: number
  magn: number
  rotation: number
  config: {
    chart: {
      type: string
      width: number
      height: number
    }
    title: { text: string }
    xAxis?: {
      categories: string[]
    }
    plotOptions?: {
      pie?: {
        innerSize?: string
        borderWidth?: number
        borderColor?: string
        dataLabels?: {
          enabled: boolean
        }
      }
    }
    series: {
      name: string
      data: Array<{ name: string; y: number; color: string } | number>
    }[]
  }
  centerText?: string
}

export interface ElementConfig {
  type: "element"
  name: string
  svg: string
  x: number
  y: number
  magn: number
  rotation: number
}

export type CanvasElement = ChartConfig | ElementConfig

export interface DrawingElement {
  id: string
  type: "line" | "text"
  points?: Point[]
  text?: string
  color: string
  x?: number
  y?: number
  fontSize?: number
  fontFamily?: string
  textAlign?: "left" | "center" | "right"
  isDragging?: boolean
}

export interface Slide {
  id: string
  elements: CanvasElement[]
  drawingElements: DrawingElement[]
  selectedElementIndex: number | null
}

export interface CanvasState {
  zoom: number
  activeTool: "line" | "text" | "eraser" | null
  currentColor: string
  selectedTextElement: DrawingElement | null
  isDrawing: boolean
  currentPath: DrawingElement | null
  textInput: Point | null
}

