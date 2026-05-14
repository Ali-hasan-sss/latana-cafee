import path from "path";
import { unlink } from "fs/promises";
import { getPublicUploadsRootDir } from "@/lib/paths/public-uploads-root";

/** Deletes a file under `public/uploads/` only (safe path). */
export async function deletePublicUploadIfSafe(relativeUrl: string): Promise<void> {
  const p = relativeUrl.trim();
  if (!p.startsWith("/uploads/") || p.includes("..") || p.includes("\\")) {
    return;
  }
  const rel = p.replace(/^\/?uploads\/?/, "").replace(/^\/+/, "");
  if (!rel || rel.includes("..")) return;

  const uploadsRoot = getPublicUploadsRootDir();
  const abs = path.resolve(uploadsRoot, rel);
  const resolvedRoot = path.resolve(uploadsRoot);
  const relCheck = path.relative(resolvedRoot, abs);
  if (relCheck.startsWith("..") || path.isAbsolute(relCheck)) {
    return;
  }
  await unlink(abs).catch(() => {
    /* already removed or missing */
  });
}
