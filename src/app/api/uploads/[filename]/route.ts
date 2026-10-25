import { readFile } from "node:fs/promises";
import path from "node:path";
import { uploadDirectory, uploadNamePattern, imageExtension } from "@/lib/product-media";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!uploadNamePattern.test(filename)) return new Response("Not found", { status: 404 });
  try {
    const content = await readFile(path.join(/* turbopackIgnore: true */ uploadDirectory(), filename));
    const extension = imageExtension(content);
    if (!extension) return new Response("Not found", { status: 404 });
    const type = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" }[extension];
    return new Response(new Uint8Array(content), { headers: {
      "Content-Type": type, "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=31536000, immutable",
    } });
  } catch { return new Response("Not found", { status: 404 }); }
}
