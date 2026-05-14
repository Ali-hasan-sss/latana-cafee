import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPublicUploadsRootDir } from "@/lib/paths/public-uploads-root";

export const runtime = "nodejs";

/** Filenames produced by the admin upload API (UUID + webp/pdf). */
const SAFE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|pdf)$/i;

const MIME: Record<string, string> = {
  webp: "image/webp",
  pdf: "application/pdf",
};

/**
 * Serves `/uploads/…` from disk so uploads work even when a reverse proxy mis-handles
 * `public/` static files; still only allows known-safe filenames.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ path?: string[] }> },
) {
  const { path: segments } = await context.params;
  const name = segments?.join("/") ?? "";
  if (!name || name.includes("/") || name.includes("..") || name.startsWith(".")) {
    return new NextResponse(null, { status: 404 });
  }
  if (!SAFE_NAME.test(name)) {
    return new NextResponse(null, { status: 404 });
  }

  const root = path.resolve(getPublicUploadsRootDir());
  const abs = path.resolve(root, name);
  const rel = path.relative(root, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return new NextResponse(null, { status: 404 });
  }

  let buf: Buffer;
  try {
    buf = await readFile(abs);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME[ext] ?? "application/octet-stream";

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
