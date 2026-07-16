import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { user_photo, garment_photo, garment_name, mode, outfit_pieces } = await req.json();

    if (!user_photo || !garment_photo) {
      return Response.json({ error: "user_photo and garment_photo are required" }, { status: 400 });
    }

    const garmentDesc = garment_name || "clothing item";
    console.log("Virtual try-on:", garmentDesc, "| mode:", mode || "article");

    // Règle absolue commune à tous les modes : tout est identique sauf le vêtement
    const PRESERVE_RULE = `
ABSOLUTE NON-NEGOTIABLE RULES — violating any rule makes the output invalid:
1. BACKGROUND: The background must be COMPLETELY UNCHANGED and pixel-perfect identical to the first photo. Same room, walls, floor, furniture, objects, colors, depth-of-field, blur. Do NOT alter the background in any way whatsoever.
2. POSE & POSTURE: The person's pose, body posture, stance, arm positions, leg positions, head tilt, and body orientation must be EXACTLY identical to the first photo. Do NOT change the pose even slightly.
3. FACE & IDENTITY: The person's face, hair, skin tone, eye color, makeup, expression, and every facial feature must be PERFECTLY preserved from the first photo. Do NOT alter the face.
4. LIGHTING: Lighting, shadows, highlights, ambient color, exposure, and color grading must be IDENTICAL to the first photo. Do NOT change brightness or lighting.
5. ONLY CHANGE: The ONLY thing that changes is the clothing/garment on the body — replace it exactly with the garment from the second photo.
6. FIT: The new garment must drape and fit naturally on the person's exact body shape and current pose.
7. PHOTOREALISM: Output must look like a real unedited photograph.
8. NO ADDITIONS: Do NOT add accessories, objects, or any element not already present in either photo.
`;

    let prompt;
    if (mode === "outfit" && outfit_pieces) {
      const parts = [
        outfit_pieces.top && "top/shirt",
        outfit_pieces.bottom && "pants/skirt/bottom",
        outfit_pieces.shoes && "shoes/footwear",
      ].filter(Boolean).join(" and ");
      prompt = `Virtual fashion try-on. The person in the FIRST photo is wearing a new ${parts} from the SECOND reference image.
${PRESERVE_RULE}`;
    } else if (mode === "exchange") {
      prompt = `Virtual fashion try-on. Take the person exactly as they appear in the FIRST photo and replace only their clothing with the complete outfit shown in the SECOND reference photo.
${PRESERVE_RULE}`;
    } else {
      prompt = `Virtual fashion try-on. The person in the FIRST photo is now wearing the exact "${garmentDesc}" shown in the SECOND reference photo.
${PRESERVE_RULE}`;
    }

    console.log("Calling GenerateImage with strict preserve rules...");

    const { url } = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt,
      existing_image_urls: [user_photo, garment_photo],
    });

    console.log("Generated:", url);
    return Response.json({ result_url: url, demo_mode: false });

  } catch (error) {
    console.error("shAiTryOn error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});