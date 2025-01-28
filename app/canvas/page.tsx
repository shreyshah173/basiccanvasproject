"use client"

import { useSearchParams } from "next/navigation"
import { Canvas } from "@/components/canvas"
import { Toolbar } from "@/components/toolbar"
import { Sidebar } from "@/components/sidebar"
import type { CanvasElement } from "@/types/canvas"

// Sample data as provided
const data: CanvasElement[] = [
  {
    type: "element",
    name: "Blue Rectangle",
    svg: `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='60'>
      <rect width='120' height='60' fill='blue' stroke='black' stroke-width='3' rx='10' ry='10' />
    </svg>`,
    x: 50,
    y: 50,
    magn: 1,
    rotation: 0,
  },
  {
    type: "chart",
    name: "Line Chart",
    x: 200,
    y: 300,
    magn: 1,
    rotation: 0,
    config: {
      chart: {
        type: "line",
        width: 400,
        height: 300,
      },
      title: { text: "Line Chart Example" },
      xAxis: {
        categories: ["Jan", "Feb", "Mar", "Apr"],
      },
      series: [
        {
          data: [15, 20, 35, 50],
          name: "Sales",
        },
        {
          data: [5, 15, 25, 35],
          name: "Revenue",
        },
      ],
    },
  },
  {
    type: "chart",
    name: "Doughnut Chart",
    x: 500,
    y: 200,
    magn: 1,
    rotation: 0,
    config: {
      chart: {
        type: "pie",
        width: 300,
        height: 300,
      },
      title: { text: "" },
      plotOptions: {
        pie: {
          innerSize: "70%",
          borderWidth: 2,
          borderColor: "transparent",
          dataLabels: {
            enabled: false,
          },
        },
      },
      series: [
        {
          name: "Data",
          data: [
            { name: "Moderate", y: 182, color: "#f6c23e" },
            { name: "Other", y: 100, color: "#e4e4e4" },
          ],
        },
      ],
    },
    centerText: "My Text",
  },
]

export default function CanvasPage() {
  const searchParams = useSearchParams()
  const width = Number.parseInt(searchParams.get("width") || "1200")
  const height = Number.parseInt(searchParams.get("height") || "800")

  return (
    <div className="flex h-screen">
      <Toolbar elements={data.filter((item) => item.type === "element")} />
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-4">
          <Canvas width={width} height={height} />
        </div>
      </div>
      <Sidebar elements={data.filter((item) => item.type === "chart")} />
    </div>
  )
}

