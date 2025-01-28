export type ChartConfig = {
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
      data: any[]
    }[]
  }
  centerText?: string
}

export type ElementConfig = {
  type: "element"
  name: string
  svg: string
  x: number
  y: number
  magn: number
  rotation: number
}

export type CanvasElement = ChartConfig | ElementConfig

