import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

export interface ControlNetResponse {
  output_url?: string;
}

/**
 * Generates an AI image using SDXL + optional ControlNet style.
 * @param face_image_url Public URL of uploaded image
 */
export async function callControlNet(face_image_url: string): Promise<ControlNetResponse> {
  try {
    const input = {
      prompt: "kid cartoon face, clean edges, cute style",
      input_image: face_image_url,           // public URL of uploaded file
      negative_prompt: "ugly, low quality, deformed face, nsfw",
      guidance_scale: 7,
      img2img_canny_strength: 0.5,
      img2img_depth_strength: 0.7
    };

    // Free SDXL model (no paid credits required)
    const output: any = await replicate.run(
     "stability-ai/stable-diffusion-3.5-large",
      { input }
    );

    return {
      output_url: Array.isArray(output) ? output[0].url : output.url,
    };
  } catch (err: unknown) {
   if (err instanceof Error) {
    console.error("AI ERROR RAW:", err.message);
  } else {
    console.error("AI ERROR RAW:", err);
  }
  throw new Error("ControlNet generation failed");
}
}