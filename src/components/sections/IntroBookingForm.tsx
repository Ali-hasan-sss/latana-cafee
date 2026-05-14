"use client";

import { useActionState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { submitBooking, type BookingFormState } from "@/app/actions/booking";
import {
  SITE_LOADING_END,
  SITE_LOADING_START,
} from "@/components/providers/SiteLoadingProvider";

function openNativeDateTimePicker(el: HTMLInputElement) {
  if (typeof el.showPicker === "function") {
    try {
      el.showPicker();
    } catch {
      /* not allowed or unsupported */
    }
  }
}

function todayISOLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function IconTime({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

const control =
  "form-control block w-full border-0 bg-white px-5 py-[14px] text-[15px] leading-normal text-[#212529] placeholder-[#6c757d] focus:outline-none focus:ring-2 focus:ring-white/90";

/** Native date/time: scheme + room for calendar/clock affordance */
const dateTimeControl = `${control} intro-booking-dt min-h-[52px] cursor-pointer [color-scheme:light]`;

const wrapIntro =
  "book bg-brand-primary p-4 text-[#212529] md:w-[420px] md:max-w-[100%] md:flex-shrink-0 xl:w-[450px] ftco-animate";

const wrapEmbedded =
  "book bg-brand-primary p-4 text-[#212529] ftco-animate w-full max-w-xl md:max-w-xl lg:max-w-2xl";

const wrapMenuOverlap =
  "book bg-brand-primary w-full p-4 text-[#212529] shadow-[0_20px_50px_rgba(0,0,0,0.32)] md:p-6 ftco-animate";

type Props = {
  /** `embedded`: map/contact column · `menuOverlap`: hero overlap card on menu page */
  variant?: "intro" | "embedded" | "menuOverlap";
};

export function IntroBookingForm({ variant = "intro" }: Props) {
  const t = useTranslations("intro");
  const locale = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(
    submitBooking,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
    }
  }, [state?.ok]);

  useEffect(() => {
    if (!pending) return;
    window.dispatchEvent(new Event(SITE_LOADING_START));
    return () => {
      window.dispatchEvent(new Event(SITE_LOADING_END));
    };
  }, [pending]);

  return (
    <div
      className={
        variant === "embedded"
          ? wrapEmbedded
          : variant === "menuOverlap"
            ? wrapMenuOverlap
            : wrapIntro
      }
      data-aos="fade-up"
      data-aos-duration="800"
      data-aos-delay="150"
    >
      <h3 className="mb-4 text-xl font-semibold text-[#212529]">{t("bookTitle")}</h3>

      {state?.message ? (
        <p
          className={`mb-4 text-sm font-medium ${
            state.ok ? "text-[#1a4d1a]" : "text-[#5c1010]"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <form
        ref={formRef}
        action={formAction}
        className="appointment-form intro-booking space-y-4"
        noValidate
      >
        <input type="hidden" name="locale" value={locale} />
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="hp-field"
          aria-hidden
        />

        <div className="d-md-flex flex flex-col gap-4 md:flex-row md:gap-0">
          <div className="form-group min-w-0 flex-1">
            <input
              type="text"
              name="firstName"
              placeholder={t("firstName")}
              className={control}
              autoComplete="given-name"
              disabled={pending}
            />
          </div>
          <div className="form-group min-w-0 flex-1 md:ms-4">
            <input
              type="text"
              name="lastName"
              placeholder={t("lastName")}
              className={control}
              autoComplete="family-name"
              disabled={pending}
            />
          </div>
        </div>

        <div className="d-md-flex flex flex-col gap-4 md:flex-row md:gap-0">
          <div className="form-group min-w-0 flex-1">
            <div className="input-wrap relative">
              <div className="icon pointer-events-none absolute start-5 top-1/2 z-[1] -translate-y-1/2 text-brand-primary">
                <IconCalendar className="h-5 w-5" />
              </div>
              <input
                type="date"
                name="date"
                min={todayISOLocal()}
                aria-label={t("date")}
                className={`${dateTimeControl} appointment_date ps-12`}
                disabled={pending}
                onClick={(e) => openNativeDateTimePicker(e.currentTarget)}
              />
            </div>
          </div>
          <div className="form-group min-w-0 flex-1 md:ms-4">
            <div className="input-wrap relative">
              <div className="icon pointer-events-none absolute start-5 top-1/2 z-[1] -translate-y-1/2 text-brand-primary">
                <IconTime className="h-5 w-5" />
              </div>
              <input
                type="time"
                name="time"
                step={300}
                aria-label={t("time")}
                className={`${dateTimeControl} appointment_time ps-12`}
                disabled={pending}
                onClick={(e) => openNativeDateTimePicker(e.currentTarget)}
              />
            </div>
          </div>
        </div>

        <div className="d-md-flex flex flex-col gap-4 md:flex-row md:gap-0">
          <div className="form-group min-w-0 flex-1">
            <input
              type="text"
              name="phone"
              placeholder={t("phone")}
              className={control}
              autoComplete="tel"
              disabled={pending}
            />
          </div>
          <div className="form-group min-w-0 flex-1 md:ms-4">
            <input
              type="number"
              name="partySize"
              min={1}
              max={99}
              step={1}
              inputMode="numeric"
              placeholder={t("partySize")}
              aria-label={t("partySize")}
              className={control}
              disabled={pending}
            />
          </div>
        </div>

        <div className="d-md-flex flex flex-col gap-4 md:flex-row md:items-end">
          <div className="form-group min-w-0 flex-1">
            <textarea
              name="message"
              cols={30}
              rows={2}
              placeholder={t("message")}
              className={control}
              disabled={pending}
            />
          </div>
          <div className="form-group shrink-0 md:ms-4">
            <input
              type="submit"
              value={pending ? t("bookingSending") : t("submit")}
              className="btn btn-white w-full cursor-pointer border-0 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#212529] transition-colors hover:bg-[#f0f0f0] disabled:opacity-60 md:w-auto md:py-3"
              disabled={pending}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
