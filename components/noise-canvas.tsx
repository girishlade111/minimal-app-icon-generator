"use client"

import * as React from "react"

/**
 * Animated static noise (old-school TV).
 * - Regenerates a noise tile each frame, jitters offset, and scales pattern for chunky static.
 *
 * Props:
 * - active: start/stop animation
 * - fps: frames per second (default 30)
 * - opacity: overall opacity of the noise (0.22–0.45 for light bg)
 * - mode: "light" | "dark" (blend mode multiply vs screen)
 * - strength: 0..1 contrast of the noise (default 0.85)
 * - scale: >1 increases grain size (default 3)
 * - className: positioning classes (usually absolute inset-0)
 */
export default function NoiseCanvas({
  active = true,
  fps = 30,
  opacity = 0.32,
  mode = "light",
  strength = 0.85,
  scale = 3,
  className = "",
}: {
  active?: boolean
  fps?: number
  opacity?: number
  mode?: "light" | "dark"
  strength?: number
  scale?: number
  className?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const rafRef = React.useRef<number | null>(null)
  const stopRef = React.useRef(false)
  const lastFrameRef = React.useRef(0)
  const offscreenRef = React.useRef<HTMLCanvasElement | null>(null)

  // Create offscreen noise tile
  React.useEffect(() => {
    if (!offscreenRef.current) {
      const oc = document.createElement("canvas")
      // 128 gives nice randomness; we scale it up via 'scale'
      oc.width = 128
      oc.height = 128
      offscreenRef.current = oc
    }
  }, [])

  // Resize visible canvas to parent
  React.useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      const rect = parent.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(rect.width * dpr))
      canvas.height = Math.max(1, Math.floor(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])

  // Draw loop
  React.useEffect(() => {
    stopRef.current = !active
    const canvas = canvasRef.current
    const off = offscreenRef.current
    if (!canvas || !off) return
    const ctx = canvas.getContext("2d", { alpha: true })
    const octx = off.getContext("2d", { alpha: true })
    if (!ctx || !octx) return

    // Improve crispness
    // @ts-expect-error imageSmoothingEnabled exists
    ctx.imageSmoothingEnabled = false
    // @ts-expect-error imageSmoothingEnabled exists
    octx.imageSmoothingEnabled = false

    const drawNoiseTile = () => {
      const w = off.width
      const h = off.height
      const imageData = octx.createImageData(w, h)
      const data = imageData.data
      const base = mode === "light" ? 150 : 105
      const spread = Math.max(8, Math.min(96, Math.floor(24 + strength * 96))) // more strength => more contrast
      for (let i = 0; i < data.length; i += 4) {
        const n = base + Math.floor((Math.random() - 0.5) * spread)
        data[i] = n
        data[i + 1] = n
        data[i + 2] = n
        data[i + 3] = 255
      }
      octx.putImageData(imageData, 0, 0)
    }

    const render = (t: number) => {
      if (stopRef.current) return
      const minDelta = 1000 / Math.max(1, fps)
      if (t - lastFrameRef.current >= minDelta) {
        lastFrameRef.current = t

        // Regenerate noise and jitter the pattern with scale
        drawNoiseTile()
        const pattern = ctx.createPattern(off, "repeat")
        if (pattern) {
          const jx = Math.random() * off.width
          const jy = Math.random() * off.height

          // Clear canvas in identity space
          ctx.setTransform(1, 0, 0, 1, 0, 0)
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Apply scaling and jittered translation for chunky, animated static
          const s = Math.max(1, scale)
          ctx.setTransform(s, 0, 0, s, jx, jy)
          ctx.fillStyle = pattern as any
          // Fill large enough area accounting for transform
          ctx.fillRect(-jx / s, -jy / s, canvas.width / s + off.width, canvas.height / s + off.height)

          // Reset transform
          ctx.setTransform(1, 0, 0, 1, 0, 0)
        }
      }
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => {
      stopRef.current = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, fps, mode, strength, scale])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      style={{
        opacity,
        mixBlendMode: mode === "light" ? ("multiply" as any) : ("screen" as any),
      }}
    />
  )
}
