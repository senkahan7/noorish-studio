import { useEffect, useRef, useCallback } from 'react'

export interface MouseParallaxData {
  /** Raw normalized target: -1 to 1 on each axis */
  target: { x: number; y: number }
  /** Smoothed value after lerp — update this in useFrame or rAF */
  smooth: { x: number; y: number }
  /** Call this each frame to advance the lerp */
  lerp: (factor?: number) => void
  /** Multiplier applied to final output values */
  strength: number
}

/**
 * useMouseParallax
 *
 * Tracks the mouse position and exposes both a raw "target" and a lerped
 * "smooth" version. Designed for use inside R3F useFrame loops — the lerp()
 * call is intentionally imperative so Three.js can drive it without React
 * re-renders.
 *
 * @param strength  How far the scene shifts at the extremes (in world units).
 *                  Defaults to 0.5 — tune per-scene.
 *
 * Usage in R3F scene:
 *   const parallax = useMouseParallax(0.4)
 *   useFrame(() => {
 *     parallax.lerp(0.05)
 *     mesh.position.x = parallax.smooth.x * parallax.strength
 *   })
 *
 * Usage for DOM parallax:
 *   const parallax = useMouseParallax()
 *   // In a rAF loop or CSS variable setter
 */
export function useMouseParallax(strength: number = 0.5): MouseParallaxData {
  const target = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      // Normalize viewport coords → [-1, 1], Y flipped for natural 3D convention
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }

    // Graceful fallback for touch / no-mouse environments:
    // center stays at (0, 0) which is fine for all scenes
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const lerp = useCallback((factor: number = 0.05) => {
    smooth.current.x += (target.current.x - smooth.current.x) * factor
    smooth.current.y += (target.current.y - smooth.current.y) * factor
  }, [])

  return {
    target: target.current,
    smooth: smooth.current,
    lerp,
    strength,
  }
}
