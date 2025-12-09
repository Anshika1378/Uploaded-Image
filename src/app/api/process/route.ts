import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { callControlNet, ControlNetResponse } from "../../../../utils/instant";

export async function POST(req: Request) {
  let uploadedUrl = "";
  try {
    const form = await req.formData();
    const file = form.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to public/uploads
    const publicDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    const filePath = path.join(publicDir, file.name);
    fs.writeFileSync(filePath, buffer);

    // Public URL
    uploadedUrl = `http://localhost:3000/uploads/${file.name}`;

    // Generate AI image
    const aiResp: ControlNetResponse = await callControlNet(uploadedUrl);

    // Return AI image if generated successfully
    return NextResponse.json({
      uploaded_url: uploadedUrl,
      ai_url: aiResp.output_url || uploadedUrl, // fallback to uploaded image
    });
  } catch (err: unknown) {
    console.error("SERVER ERROR:", err);
    // Always return uploaded image even if AI fails
    return NextResponse.json({
      uploaded_url: uploadedUrl,
      ai_url: uploadedUrl,
      error: "AI generation failed, showing uploaded image",
    }, { status: 200 });
  }
}
