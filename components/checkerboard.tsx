"use client"

import * as React from "react"

/**
 * Subtle checkerboard backdrop to visualize transparency.
 *
 * size: square size in px (default 12)
 * c1/c2: checker colors
 */
export default function Checkerboard({
  size = 12,
  c1 = "#f6f7f9",
  c2 = "#e9edf2",
  className = "",
}: {
  size?: number
  c1?: string
  c2?: string
  className?: string
}) {
  const half = Math.floor(size / 2)
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(45deg, ${c1} 25%, transparent 25%),
          linear-gradient(-45deg, ${c1} 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${c1} 75%),
          linear-gradient(-45deg, transparent 75%, ${c1} 75%)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `0 0, 0 ${half}px, ${half}px -${half}px, -${half}px 0px`,
        backgroundColor: c2,
      }}
    />
  )
}
