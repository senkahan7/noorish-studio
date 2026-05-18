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

// Mouse parallax hook: provides target, smooth, lerp, strength

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
