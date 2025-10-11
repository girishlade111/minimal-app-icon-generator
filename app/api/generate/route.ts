import {
  experimental_generateImage as generateImage,
  LoadAPIKeyError,
  NoImageGeneratedError,
} from "ai"
import { openai } from "@ai-sdk/openai"

// Strong minimal style guidance to reduce cartoonish outputs.
const STYLE_GUIDE = [
  "Ultra-minimal, flat, geometric app icon for a modern product.",
  "Absolutely no mascots, animals, birds, faces, characters, emoji, or clip-art.",
  "No borders, text, watermarks, rounded-corner frames, or badges.",
  "Aim for black only, with transparent background.",
  "If necessary, 1–2 harmonious colors (prefer neutral or subtle duotone); avoid saturated neon.",
  "Flat shapes with clean edges; no thick outlines, no heavy shadows, no skeuomorphism.",
  "If gradients are used, keep them extremely subtle; avoid glow, glass, and bevels.",
  "Centered composition with generous negative space; strong silhouette readable at 48–128 px.",
  "Full-bleed background that fills the canvas edge-to-edge; platform will apply the rounded mask.",
  "Every icon should be cool enough to wear on a hat or shirt. Nothing cheesy.",
  "Design should be timeless.",
  "Output must be a crisp 1024×1024 PNG suitable for an app icon.",
].join(" ")

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== "string") {
      return Response.json({ success: false, error: "Prompt is required" }, { status: 400 })
    }

    const finalPrompt =
      `Create a 1024×1024 PNG app icon.\n` +
      `${STYLE_GUIDE}\n` +
      `Subject: ${prompt}`

    const { image } = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt: finalPrompt,
      // size: "1024x1024",
      // quality: "high",
    })

    if (!image) throw new NoImageGeneratedError({ message: "No image returned" })

    const bytes: Uint8Array = (image as any).uint8Array ?? new Uint8Array()
    if (!bytes.length) throw new Error("Empty image data received")

    return new Response(bytes, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
      },
    })
  } catch (error: any) {
    if ((LoadAPIKeyError as any).isInstance?.(error)) {
      return Response.json(
        { success: false, error: "OpenAI API key is missing on the server." },
        { status: 500 }
      )
    }
    if ((NoImageGeneratedError as any).isInstance?.(error)) {
      return Response.json(
        { success: false, error: "No image was generated. Try refining your prompt." },
        { status: 502 }
      )
    }
    console.error(error)
    return Response.json(
      { success: false, error: "Something went wrong while generating the icon." },
      { status: 500 }
    )
  }
}
