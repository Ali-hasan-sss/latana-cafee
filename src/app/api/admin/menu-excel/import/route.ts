import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from "@/lib/auth/admin-token";
import { parseMenuExcelBuffer } from "@/lib/cms/menu-excel";
import { getMenuPage } from "@/lib/data";

export const runtime = "nodejs";

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
    return NextResponse.json({ errorKey: "parse" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ errorKey: "parse" }, { status: 400 });
  }

  const defaultItemImage =
    getMenuPage().pricingColumns[0]?.items[0]?.image?.trim() || "/images/IMG_8417.JPG.jpeg";

  const buf = await file.arrayBuffer();
  const result = parseMenuExcelBuffer(buf, defaultItemImage);

  if (!result.ok) {
    return NextResponse.json({ ok: false, errorKey: result.errorKey }, { status: 400 });
  }

  return NextResponse.json({ ok: true, pricingColumns: result.pricingColumns });
}
