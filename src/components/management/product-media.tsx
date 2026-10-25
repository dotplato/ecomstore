"use client";
import Image from "next/image";
import { useState } from "react";
export function ProductMedia({ initialUrls = [] }: { initialUrls?: string[] }) {
  const [value, setValue] = useState(initialUrls.join("\n"));
  const [files, setFiles] = useState<string[]>([]);
  const urls = value.split("\n").map(url => url.trim()).filter(url => /^https:\/\//.test(url) || /^\/api\/uploads\//.test(url));
  return <div className="space-y-3">
    <label className="block text-sm font-medium">Image URLs
      <textarea name="images" value={value} onChange={event => setValue(event.target.value)} rows={3} placeholder="https://example.com/product.jpg (one URL per line)" className="mt-1 block w-full rounded-xl border border-border p-3 font-normal" />
    </label>
    {urls.length > 0 && <div className="flex flex-wrap gap-2">{urls.map((url, index) => <div key={index} className="relative h-20 w-20 rounded-xl border border-border bg-muted/40">
      <Image unoptimized src={url} alt={`Product image ${index + 1}`} fill className="rounded-xl object-contain p-1" />
      <button type="button" aria-label={`Remove image ${index + 1}`} className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-foreground text-xs text-white" onClick={() => setValue(value.split("\n").filter(line => line.trim() !== url).join("\n"))}>×</button>
    </div>)}</div>}
    <label className="block text-sm font-medium">Or upload images
      <input type="file" name="uploads" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={event => setFiles(Array.from(event.target.files ?? []).map(file => file.name))} className="mt-2 block w-full rounded-xl border border-dashed border-border p-3 text-sm font-normal file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-3 file:py-1 file:text-sm" />
    </label>
    <p className="text-xs text-muted-foreground">JPEG, PNG, WebP or GIF. Up to 5 MB each, 20 MB total. Uploads are added to the URLs above. At least one image is required.</p>
    {files.length > 0 && <p className="text-xs text-primary">{files.length} file(s) selected: {files.join(", ")}</p>}
  </div>;
}
