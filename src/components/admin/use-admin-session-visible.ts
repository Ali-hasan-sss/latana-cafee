"use client";

import { useEffect, useState } from "react";

export function useAdminSessionVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/session-check", { credentials: "same-origin" });
        const data = (await res.json()) as { ok?: boolean };
        if (!cancelled && data.ok) {
          setVisible(true);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return visible;
}
