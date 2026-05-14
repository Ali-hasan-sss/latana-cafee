/** Server-only: HTML + plain-text bodies for table booking notifications. */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type BookingMailRow = { label: string; value: string };

function rowHtml(r: BookingMailRow): string {
  const v = r.value.trim() || "—";
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #ece8e2;font-size:13px;color:#6b635a;width:38%;vertical-align:top;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${escapeHtml(r.label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #ece8e2;font-size:15px;color:#1a1512;font-weight:600;vertical-align:top;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">${escapeHtml(v)}</td>
  </tr>`;
}

export function buildBookingMailHtml(params: {
  heading: string;
  rows: BookingMailRow[];
}): string {
  const rows = params.rows.map(rowHtml).join("");
  const heading = escapeHtml(params.heading);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#ebe6df;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ebe6df;padding:28px 14px;">
  <tr>
    <td align="center" dir="ltr">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(26,21,18,0.12);">
        <tr>
          <td style="background:linear-gradient(125deg,#2a231d 0%,#4a3f35 55%,#6b5a4a 100%);padding:32px 28px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#d4b896;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Latana Cafe</p>
            <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:650;color:#faf6f1;font-family:Georgia,'Times New Roman',serif;">${heading}</h1>
            <p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:rgba(250,246,241,0.78);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">Website reservation request</p>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 28px 4px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              ${rows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px 28px;text-align:center;">
            <p style="margin:0;font-size:12px;line-height:1.6;color:#9a9188;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">This message was sent from the website booking form.<br/>Reply directly to the guest using the phone number above.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function buildBookingMailText(rows: BookingMailRow[]): string {
  return rows.map((r) => `${r.label}: ${r.value.trim() || "—"}`).join("\n");
}
