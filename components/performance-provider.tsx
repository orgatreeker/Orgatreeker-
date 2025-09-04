"use client"

import { memo, createContext, useContext, type ReactNode } from "react"

// Performance context for optimizations
interface PerformanceContextType {
  isLowEndDevice: boolean
  prefersReducedMotion: boolean
}

const PerformanceContext = createContext<PerformanceContextType>({
  isLowEndDevice: false,
  prefersReducedMotion: false,
})

export const usePerformance = () => useContext(PerformanceContext)

interface PerformanceProviderProps {
  children: ReactNode
}

export const PerformanceProvider = memo(function PerformanceProvider({ children }: PerformanceProviderProps) {
  // Detect low-end devices and user preferences
  const isLowEndDevice =
    typeof navigator !== "undefined" && (navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 4)

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <PerformanceContext.Provider value={{ isLowEndDevice, prefersReducedMotion }}>
      {children}
    </PerformanceContext.Provider>
  )
})
