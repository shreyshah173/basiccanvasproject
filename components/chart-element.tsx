"use client"

import { useRef } from "react"
import type { ChartConfig } from "@/types/canvas"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"

interface ChartElementProps {
  element: ChartConfig
  onMove: (position: { x: number; y: number }) => void
}

export function ChartElement({ element, onMove }: ChartElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startPos.current = {
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return

    const x = e.clientX - startPos.current.x
    const y = e.clientY - startPos.current.y
    onMove({ x, y })
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const renderChart = () => {
    if (element.config.chart.type === "line") {
      return (
        <LineChart
          width={element.config.chart.width}
          height={element.config.chart.height}
          data={element.config.xAxis?.categories.map((category, index) => ({
            name: category,
            ...element.config.series.reduce(
              (acc, series) => ({
                ...acc,
                [series.name]: series.data[index],
              }),
              {},
            ),
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {element.config.series.map((series, index) => (
            <Line key={index} type="monotone" dataKey={series.name} stroke={`hsl(${index * 60}, 70%, 50%)`} />
          ))}
        </LineChart>
      )
    }

    if (element.config.chart.type === "pie") {
      return (
        <div className="relative">
          <PieChart width={element.config.chart.width} height={element.config.chart.height}>
            <Pie
              data={element.config.series[0].data}
              cx="50%"
              cy="50%"
              innerRadius={
                element.config.plotOptions?.pie?.innerSize
                  ? (Number.parseInt(element.config.plotOptions.pie.innerSize) / 100) * 150
                  : 0
              }
              outerRadius={150}
              dataKey="y"
            >
              {element.config.series[0].data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          {element.centerText && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-lg font-medium">{element.centerText}</span>
            </div>
          )}
        </div>
      )
    }
  }

  return (
    <div
      ref={elementRef}
      className="absolute cursor-move"
      style={{
        transform: `translate(${element.x}px, ${element.y}px) rotate(${element.rotation}deg) scale(${element.magn})`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
      onMouseUp={handleMouseUp}
    >
      {renderChart()}
    </div>
  )
}

