import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getMenuPageSettingsForAdmin } from "@/app/actions/menu-page-settings-admin";
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/auth/admin-token";
import { buildMenuExcelFromDocument } from "@/lib/cms/menu-excel";

export const runtime = "nodejs";

export async function GET() {
  const store = await cookies();
  const token = store.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await getMenuPageSettingsForAdmin();
  const body = buildMenuExcelFromDocument(doc);
  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="latana-menu-export.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
