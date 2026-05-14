"use client";

import { useCallback, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  label?: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  /** Passed to `<input type="file" accept={…} />` */
  accept?: string;
  disabled?: boolean;
  id?: string;
};

export function AdminFileUpload({
  label,
  hint,
  value,
  onChange,
  accept = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif",
  disabled = false,
  id: idProp,
}: Props) {
  const t = useTranslations("adminUi");
  const labelText = label ?? t("upload.defaultLabel");
  const autoId = useId();
  const inputId = idProp ?? `upload-${autoId}`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const body = new FormData();
        body.set("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body,
          credentials: "same-origin",
        });
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
          errorKey?: string;
        };
        if (!res.ok) {
          if (data.errorKey === "upload.outputTooLarge") {
            setError(t("upload.outputTooLarge"));
          } else if (data.errorKey === "upload.rawTooLarge") {
            setError(t("upload.rawTooLarge"));
          } else if (data.errorKey === "upload.invalidImage") {
            setError(t("upload.invalidImage"));
          } else {
            setError(data.error ?? t("common.uploadFailedStatus", { status: res.status }));
          }
          return;
        }
        if (typeof data.url === "string" && data.url.startsWith("/")) {
          onChange(data.url);
        } else {
          setError(t("common.invalidServerResponse"));
        }
      } catch {
        setError(t("common.networkUploadError"));
      } finally {
        setUploading(false);
      }
    },
    [onChange, t],
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const showImagePreview =
    value &&
    (value.startsWith("/") || /^https?:\/\//i.test(value)) &&
    !value.toLowerCase().endsWith(".pdf");

  return (
    <div className="space-y-2">
      {labelText ? (
        <span className="mb-0.5 block text-xs font-medium text-white/70">{labelText}</span>
      ) : null}

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled && !uploading) fileRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && !uploading && fileRef.current?.click()}
        className={`cursor-pointer rounded-lg border border-dashed px-3 py-4 text-center transition ${
          dragOver
            ? "border-brand-primary bg-brand-primary/10"
            : "border-white/20 bg-black/25 hover:border-white/35"
        } ${disabled || uploading ? "pointer-events-none opacity-50" : ""}`}
      >
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled || uploading}
          onChange={onInputChange}
        />
        <p className="text-xs text-white/70">
          {uploading ? t("upload.uploading") : t("upload.dropPrompt")}
        </p>
        <p className="mt-1 text-[10px] text-white/40">{t("upload.formats")}</p>
      </div>

      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {showImagePreview ? (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="mx-auto max-h-40 w-auto object-contain" />
        </div>
      ) : null}

      {hint ? <p className="text-[11px] text-white/45">{hint}</p> : null}
    </div>
  );
}
