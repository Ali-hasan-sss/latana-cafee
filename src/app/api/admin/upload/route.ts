import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminToken,
} from "@/lib/auth/admin-token";
import {
  AdminImageProcessError,
  processAdminUploadImage,
} from "@/lib/cms/process-admin-upload-image";

export const runtime = "nodejs";

/** Applied to the **saved** file (after compression for images). */
const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

/** Safety cap on raw upload size (not the 10 MB product limit). */
const MAX_RAW_IMAGE_BYTES = 100 * 1024 * 1024;
const MAX_RAW_PDF_BYTES = 20 * 1024 * 1024;

/** Server-side MIME → extension for **input** (images are re-encoded to WebP on disk). */
const ALLOWED = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["application/pdf", "pdf"],
]);

/**
 * POST multipart form-data, field name `file`.
 * Requires admin session cookie. Images are compressed server-side; max **10 MB** applies to the written file.
 */
export async function POST(request: Request) {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field" }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  const mime = (file.type || "application/octet-stream").toLowerCase();
  const inputExt = ALLOWED.get(mime);
  if (!inputExt) {
    return NextResponse.json(
      { error: "Unsupported type. Use JPEG, PNG, WebP, GIF, or PDF." },
      { status: 400 },
    );
  }

  const isPdf = mime === "application/pdf";
  if (isPdf) {
    if (file.size > MAX_RAW_PDF_BYTES) {
      return NextResponse.json({ errorKey: "upload.rawTooLarge" }, { status: 400 });
    }
  } else if (file.size > MAX_RAW_IMAGE_BYTES) {
    return NextResponse.json({ errorKey: "upload.rawTooLarge" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  let buffer = Buffer.from(bytes);

  if (isPdf) {
    if (buffer.length > MAX_OUTPUT_BYTES) {
      return NextResponse.json({ errorKey: "upload.outputTooLarge" }, { status: 400 });
    }
    const filename = `${crypto.randomUUID()}.pdf`;
    const relativeUrl = `/uploads/${filename}`;
    const dir = path.join(process.cwd(), "public", "uploads");
    const absolutePath = path.join(dir, filename);
    await mkdir(dir, { recursive: true });
    await writeFile(absolutePath, buffer);
    return NextResponse.json({ url: relativeUrl });
  }

  try {
    buffer = Buffer.from(await processAdminUploadImage(buffer, mime));
  } catch (e) {
    if (e instanceof AdminImageProcessError) {
      const errorKey = e.code === "OUTPUT_TOO_LARGE" ? "upload.outputTooLarge" : "upload.invalidImage";
      return NextResponse.json({ errorKey }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ errorKey: "upload.invalidImage" }, { status: 400 });
  }

  if (buffer.length > MAX_OUTPUT_BYTES) {
    return NextResponse.json({ errorKey: "upload.outputTooLarge" }, { status: 400 });
  }

  const filename = `${crypto.randomUUID()}.webp`;
  const relativeUrl = `/uploads/${filename}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  const absolutePath = path.join(dir, filename);

  await mkdir(dir, { recursive: true });
  await writeFile(absolutePath, buffer);

  return NextResponse.json({ url: relativeUrl });
}
