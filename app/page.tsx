"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Loader2, Download } from 'lucide-react'
import { GeistMono } from "geist/font/mono"
import NoiseCanvas from "@/components/noise-canvas"
import Checkerboard from "@/components/checkerboard"

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const ThirtyTwoFps = 32

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [imageUrl])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim() || loading) return
    setError(null)
    setImgLoaded(false)
    setLoading(true)
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
      setImageUrl(null)
    }
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
      const ct = res.headers.get("content-type") || ""
      if (!res.ok) {
        if (ct.includes("application/json")) {
          const data = await res.json().catch(() => null)
          throw new Error(data?.error || "Failed to generate icon.")
        }
        throw new Error("Failed to generate icon.")
      }
      if (ct.startsWith("image/")) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setImageUrl(url)
      } else {
        const data = await res.json().catch(() => ({}))
        if (!data?.success || !data?.image) {
          throw new Error("Unexpected response from server.")
        }
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  function downloadImage() {
    if (!imageUrl) return
    const a = document.createElement("a")
    a.href = imageUrl
    a.download = "app-icon.png"
    a.click()
  }

  const showTitle = !loading && !imageUrl

  return (
    <main className="min-h-[100svh] w-full bg-white text-neutral-900">
      <div
        className="mx-auto flex max-w-3xl flex-col items-center px-4"
        style={{ paddingTop: showTitle ? "40vh" : "8vh" }}
      >
        {/* Preview area ABOVE input */}
        {(loading || imageUrl) && (
          <div className="mb-8 w-full">
            {loading && !imageUrl ? (
              <div className="relative mx-auto aspect-square w-full max-w-[540px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                {/* Full-field animated noise like an old TV (bigger + more visible) */}
                <NoiseCanvas active={true} fps={32} opacity={0.42} mode="light" strength={0.95} scale={3.5} />
                {/* Subtle scanlines overlay */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0px, rgba(0,0,0,0.10) 1px, transparent 1px, transparent 3px)',
                  }}
                />
                {/* Gentle vignette to frame the noise */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.06) 100%)',
                  }}
                />
                {/* Inner ring */}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-black/5" />
              </div>
            ) : null}

            {imageUrl ? (
              <div className="group relative mx-auto aspect-square w-full max-w-[540px] overflow-hidden rounded-xl border border-neutral-200 bg-white">
                <Checkerboard size={12} />
                <img
                  src={imageUrl || "/placeholder.svg?height=1024&width=1024&query=icon%20preview"}
                  alt="Generated app icon preview"
                  onLoad={() => setImgLoaded(true)}
                  className={[
                    "relative z-[1] h-full w-full object-cover transition-all duration-500",
                    imgLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-sm scale-95",
                  ].join(" ")}
                />
                {/* Inner ring */}
                <div className="pointer-events-none absolute inset-0 z-10 rounded-xl ring-1 ring-black/5" />
                {/* Hover gradient overlay div with a lower z-index */}
                <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                {/* Download button container with higher z-index */}
                <div className="absolute bottom-3 right-3 z-20 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    className="bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                    onClick={downloadImage}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Title (only when idle) */}
        {showTitle ? (
          <p className={`${GeistMono.className} mb-6 text-sm text-neutral-500`}>
            {'What icon can I help you design?'}
          </p>
        ) : null}

        {/* Input */}
        <form onSubmit={handleGenerate} className="w-full">
          <div className="relative">
            <div className="group flex items-center gap-3 rounded-[28px] border border-neutral-200 bg-white px-5 py-3 shadow-[0_0_0_1px_rgba(0,0,0,0.02)_inset]">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your icon"
                className="flex-1 bg-transparent text-base text-neutral-900 placeholder:text-neutral-400 outline-none"
                aria-label="Describe your icon"
              />
              <Button
                type="submit"
                size="icon"
                className="rounded-full bg-neutral-900 text-white hover:bg-neutral-800 cursor-pointer"
                disabled={loading || !prompt.trim()}
                aria-label="Generate"
                title="Generate"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </form>

        {/* Error message */}
        {error ? (
          <p className="mt-3 text-sm text-red-500" role="status">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  )
}
