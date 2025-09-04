"use client"

import type React from "react"

import { useEffect, useRef, memo } from "react"
import { usePerformance } from "./performance-provider"

interface OptimizedSmoothScrollProps {
  children: React.ReactNode
  disabled?: boolean
}

export const OptimizedSmoothScroll = memo(function OptimizedSmoothScroll({
  children,
  disabled = false,
}: OptimizedSmoothScrollProps) {
  const { isLowEndDevice, prefersReducedMotion } = usePerformance()
  const lenisRef = useRef<any>(null)

  useEffect(() => {
    // Skip smooth scrolling on low-end devices or if user prefers reduced motion
    if (disabled || isLowEndDevice || prefersReducedMotion) {
      return
    }

    let Lenis: any

    // Dynamically import Lenis only when needed
    const initLenis = async () => {
      try {
        const { default: LenisClass } = await import("lenis")
        Lenis = LenisClass

        lenisRef.current = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: "vertical",
          gestureDirection: "vertical",
          smooth: true,
          mouseMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        })

        function raf(time: number) {
          lenisRef.current?.raf(time)
          requestAnimationFrame(raf)
        }

        requestAnimationFrame(raf)
      } catch (error) {
        console.warn("Failed to load Lenis:", error)
      }
    }

    initLenis()

    return () => {
      lenisRef.current?.destroy()
    }
  }, [disabled, isLowEndDevice, prefersReducedMotion])

  return <>{children}</>
})
