import path from "path";

/**
 * Absolute directory where `/uploads/…` files are stored (must match how they are served).
 *
 * Default: `<process.cwd()>/public/uploads` (Next serves `public/` at `/`).
 *
 * Override with `PUBLIC_UPLOADS_ABSOLUTE_PATH` when uploads live elsewhere; then point nginx
 * `location /uploads/` to that folder, or symlink `public/uploads` → that directory.
 */
export function getPublicUploadsRootDir(): string {
  const fromEnv = process.env.PUBLIC_UPLOADS_ABSOLUTE_PATH?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return path.resolve(process.cwd(), "public", "uploads");
}
