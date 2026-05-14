"use server";

import { getAdminSession } from "@/lib/auth/get-admin-session";
import { deletePublicUploadIfSafe } from "@/lib/cms/delete-public-upload";

/** Deletes files under `/uploads/` (admin-only). Used for gallery orphans and removals before save. */
export async function deleteAdminPublicUploads(urls: string[]): Promise<{ ok: boolean }> {
  const session = await getAdminSession();
  if (!session) {
    return { ok: false };
  }
  for (const u of urls) {
    await deletePublicUploadIfSafe(u);
  }
  return { ok: true };
}
