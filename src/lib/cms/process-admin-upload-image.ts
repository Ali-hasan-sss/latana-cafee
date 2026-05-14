import sharp from "sharp";

const MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

export class AdminImageProcessError extends Error {
  constructor(
    message: string,
    readonly code: "INVALID_IMAGE" | "OUTPUT_TOO_LARGE",
  ) {
    super(message);
    this.name = "AdminImageProcessError";
  }
}

/**
 * Resize + WebP encode. Enforces **output** size ≤ 10 MB (iterates quality / dimensions).
 * Animated GIFs are passed through sharp with `animated` / `pages: -1` when applicable.
 */
export async function processAdminUploadImage(input: Buffer, mime: string): Promise<Buffer> {
  const isGif = mime === "image/gif";
  const sharpOpts: sharp.SharpOptions = {
    limitInputPixels: false,
    ...(isGif ? { animated: true, pages: -1 } : {}),
  };

  try {
    await sharp(input, sharpOpts).metadata();
  } catch {
    throw new AdminImageProcessError("Invalid image data.", "INVALID_IMAGE");
  }

  let quality = 82;
  let maxDim = 2560;

  for (let round = 0; round < 18; round++) {
    let pipeline = sharp(input, sharpOpts).rotate();

    pipeline = pipeline.resize({
      width: maxDim,
      height: maxDim,
      fit: "inside",
      withoutEnlargement: true,
    });

    const webpOpts: sharp.WebpOptions = {
      quality,
      effort: isGif ? 5 : 4,
      alphaQuality: 90,
    };

    let out: Buffer;
    try {
      out = await pipeline.webp(webpOpts).toBuffer();
    } catch {
      throw new AdminImageProcessError("Could not process image.", "INVALID_IMAGE");
    }

    if (out.length <= MAX_OUTPUT_BYTES) {
      return out;
    }

    if (quality > 52) {
      quality -= 7;
    } else if (maxDim > 800) {
      maxDim -= 400;
    } else if (quality > 32) {
      quality -= 5;
    } else {
      break;
    }
  }

  throw new AdminImageProcessError("Image still exceeds 10 MB after compression.", "OUTPUT_TOO_LARGE");
}
