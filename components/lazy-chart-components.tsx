"use client"

import { lazy, Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load chart components to reduce initial bundle size
const LineChart = lazy(() => import("recharts").then((module) => ({ default: module.LineChart })))
const Line = lazy(() => import("recharts").then((module) => ({ default: module.Line })))
const XAxis = lazy(() => import("recharts").then((module) => ({ default: module.XAxis })))
const YAxis = lazy(() => import("recharts").then((module) => ({ default: module.YAxis })))
const CartesianGrid = lazy(() => import("recharts").then((module) => ({ default: module.CartesianGrid })))
const Tooltip = lazy(() => import("recharts").then((module) => ({ default: module.Tooltip })))
const ResponsiveContainer = lazy(() => import("recharts").then((module) => ({ default: module.ResponsiveContainer })))
const PieChart = lazy(() => import("recharts").then((module) => ({ default: module.PieChart })))
const Pie = lazy(() => import("recharts").then((module) => ({ default: module.Pie })))
const Cell = lazy(() => import("recharts").then((module) => ({ default: module.Cell })))
const BarChart = lazy(() => import("recharts").then((module) => ({ default: module.BarChart })))
const Bar = lazy(() => import("recharts").then((module) => ({ default: module.Bar })))

// Chart skeleton component for loading states
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className={`h-[${height}px] w-full rounded-lg`} />
      <div className="flex justify-center space-x-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

// Optimized Line Chart with lazy loading
export function OptimizedLineChart({ data, height = 300, ...props }: any) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} {...props}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis {...props.xAxisProps} />
          <YAxis {...props.yAxisProps} />
          <Tooltip {...props.tooltipProps} />
          {props.children}
        </LineChart>
      </ResponsiveContainer>
    </Suspense>
  )
}

// Optimized Pie Chart with lazy loading
export function OptimizedPieChart({ data, height = 300, ...props }: any) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart {...props}>{props.children}</PieChart>
      </ResponsiveContainer>
    </Suspense>
  )
}

// Optimized Bar Chart with lazy loading
export function OptimizedBarChart({ data, height = 300, ...props }: any) {
  return (
    <Suspense fallback={<ChartSkeleton height={height} />}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} {...props}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis {...props.xAxisProps} />
          <YAxis {...props.yAxisProps} />
          <Tooltip {...props.tooltipProps} />
          {props.children}
        </BarChart>
      </ResponsiveContainer>
    </Suspense>
  )
}

// Export lazy-loaded individual components
export {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
}
