"use server";

import { getTranslations } from "next-intl/server";
import {
  buildBookingMailHtml,
  buildBookingMailText,
} from "@/lib/booking-email-template";
import {
  createBookingTransporter,
  getBookingFrom,
  getBookingRecipient,
} from "@/lib/mail";

export type BookingFormState = {
  ok: boolean;
  message: string;
} | null;

function clean(v: FormDataEntryValue | null): string {
  return (v?.toString() ?? "").trim();
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function submitBooking(
  _prevState: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const locale = clean(formData.get("locale")) || "en";
  const t = await getTranslations({ locale, namespace: "intro" });

  if (clean(formData.get("website"))) {
    return { ok: false, message: t("bookingSpam") };
  }

  const firstName = clean(formData.get("firstName"));
  const lastName = clean(formData.get("lastName"));
  const date = clean(formData.get("date"));
  const time = clean(formData.get("time"));
  const phone = clean(formData.get("phone"));
  const email = clean(formData.get("email"));
  const message = clean(formData.get("message"));
  const partyRaw = clean(formData.get("partySize"));
  const partySize = Number.parseInt(partyRaw, 10);

  if (
    !firstName ||
    !lastName ||
    !phone ||
    !email ||
    !date ||
    !partyRaw ||
    !Number.isFinite(partySize) ||
    partySize < 1 ||
    partySize > 99
  ) {
    return { ok: false, message: t("bookingValidation") };
  }

  if (!isValidEmail(email)) {
    return { ok: false, message: t("bookingEmailInvalid") };
  }

  const transporter = createBookingTransporter();
  const to = getBookingRecipient();

  if (!transporter || !to) {
    return { ok: false, message: t("bookingConfig") };
  }

  const subject = `[Latana Cafe] ${t("bookTitle")} — ${firstName} ${lastName} (${partySize})`;

  const rows = [
    { label: t("firstName"), value: firstName },
    { label: t("lastName"), value: lastName },
    { label: t("partySize"), value: String(partySize) },
    { label: t("date"), value: date },
    { label: t("time"), value: time || "—" },
    { label: t("phone"), value: phone },
    { label: t("email"), value: email },
    { label: t("message"), value: message || "—" },
  ];

  const text = [`${t("bookTitle")}`, "---", buildBookingMailText(rows)].join("\n");
  const html = buildBookingMailHtml({
    heading: t("bookTitle"),
    rows,
  });

  try {
    await transporter.sendMail({
      from: getBookingFrom(),
      to,
      replyTo: email,
      subject,
      text,
      html,
    });
  } catch {
    return { ok: false, message: t("bookingError") };
  }

  return { ok: true, message: t("bookingSuccess") };
}
