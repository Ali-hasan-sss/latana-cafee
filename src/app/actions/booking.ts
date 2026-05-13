"use server";

import { getTranslations } from "next-intl/server";
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
  const message = clean(formData.get("message"));

  if (!firstName || !lastName || !phone || !date) {
    return { ok: false, message: t("bookingValidation") };
  }

  const transporter = createBookingTransporter();
  const to = getBookingRecipient();

  if (!transporter || !to) {
    return { ok: false, message: t("bookingConfig") };
  }

  const subject = `[Latana Cafe] ${t("bookTitle")} — ${firstName} ${lastName}`;
  const text = [
    `${t("bookTitle")}`,
    `---`,
    `${t("firstName")}: ${firstName}`,
    `${t("lastName")}: ${lastName}`,
    `${t("date")}: ${date}`,
    `${t("time")}: ${time || "—"}`,
    `${t("phone")}: ${phone}`,
    `${t("message")}: ${message || "—"}`,
  ].join("\n");

  try {
    await transporter.sendMail({
      from: getBookingFrom(),
      to,
      subject,
      text,
    });
  } catch {
    return { ok: false, message: t("bookingError") };
  }

  return { ok: true, message: t("bookingSuccess") };
}
