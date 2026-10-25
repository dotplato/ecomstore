import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";

// Uploaded media lives on a runtime volume and must not be traced into the build.
export const uploadDirectory = () => path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR || "uploads");
export const uploadNamePattern = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/;

export function imageExtension(bytes: Buffer): "jpg" | "png" | "webp" | "gif" | null {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return "jpg";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return "gif";
  return null;
}

export function validateImageUrls(value: string) {
  const urls = value.split("\n").map(url => url.trim()).filter(Boolean);
  for (const url of urls) {
    if (url.startsWith("/api/uploads/") && uploadNamePattern.test(url.slice("/api/uploads/".length))) continue;
    let parsed: URL;
    try { parsed = new URL(url); } catch { throw new Error("Image URL must be a valid HTTPS URL."); }
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) throw new Error("Image URL must use HTTPS without credentials.");
  }
  if (urls.length > 20) throw new Error("Use no more than 20 images per product.");
  return urls;
}

export async function saveProductUploads(entries: FormDataEntryValue[]) {
  const files = entries.filter((entry): entry is File => typeof entry !== "string" && entry.size > 0);
  if (files.length > 20 || files.reduce((sum, file) => sum + file.size, 0) > 20 * 1024 * 1024) throw new Error("Uploads must total 20 MB or less (maximum 20 images).");
  const prepared = [];
  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) throw new Error("Each image must be 5 MB or smaller.");
    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = imageExtension(buffer);
    if (!extension) throw new Error("Upload JPEG, PNG, WebP or GIF images only.");
    prepared.push({ buffer, name: randomUUID() + "." + extension });
  }
  const saved: string[] = [];
  try {
    if (prepared.length) await mkdir(uploadDirectory(), { recursive: true });
    for (const file of prepared) {
      await writeFile(path.join(/* turbopackIgnore: true */ uploadDirectory(), file.name), file.buffer, { flag: "wx" });
      saved.push("/api/uploads/" + file.name);
    }
  } catch (error) { await removeProductUploads(saved); throw error; }
  return saved;
}
export async function removeProductUploads(urls: string[]) {
  await Promise.all(urls.map(url => {
    const name = url.slice("/api/uploads/".length);
    return uploadNamePattern.test(name) ? unlink(path.join(/* turbopackIgnore: true */ uploadDirectory(), name)).catch(() => undefined) : Promise.resolve();
  }));
}
