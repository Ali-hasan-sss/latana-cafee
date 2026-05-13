import nodemailer from "nodemailer";

export function createBookingTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function getBookingRecipient(): string | null {
  return (
    process.env.BOOKING_EMAIL_TO?.trim() ||
    process.env.SMTP_USER?.trim() ||
    null
  );
}

export function getBookingFrom(): string {
  return (
    process.env.BOOKING_EMAIL_FROM?.trim() ||
    process.env.SMTP_USER?.trim() ||
    "noreply@localhost"
  );
}
