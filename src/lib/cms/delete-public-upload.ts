import { unlink } from "fs/promises";
import path from "path";

/** Deletes a file under `public/uploads/` only (safe path). */
export async function deletePublicUploadIfSafe(relativeUrl: string): Promise<void> {
  const p = relativeUrl.trim();
  if (!p.startsWith("/uploads/") || p.includes("..") || p.includes("\\")) {
    return;
  }
  const rel = p.replace(/^\//, "");
  const abs = path.join(process.cwd(), "public", rel);
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (!abs.startsWith(uploadsRoot)) {
    return;
  }
  await unlink(abs).catch(() => {
    /* already removed or missing */
  });
}
