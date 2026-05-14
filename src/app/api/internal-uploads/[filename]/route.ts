import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getPublicUploadsRootDir } from "@/lib/paths/public-uploads-root";

export const runtime = "nodejs";

/** Same filenames as `POST /api/admin/upload` (UUID + webp/pdf). */
const SAFE_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(webp|pdf)$/i;

const MIME: Record<string, string> = {
  webp: "image/webp",
  pdf: "application/pdf",
};

/**
 * Serves upload bytes. Invoked internally via `beforeFiles` rewrite from `/uploads/:filename`
 * so requests are not swallowed by the `public/` layer (which can 404 before App routes run).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ filename: string }> },
) {
  const { filename: raw } = await context.params;
  let name = raw;
  try {
    name = decodeURIComponent(raw);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

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
