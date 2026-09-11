"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ChevronDown, Loader2 } from "lucide-react";

import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { EASE } from "@/components/shared/motion";
import { Turnstile, type TurnstileHandle } from "@/components/shared/turnstile";
import { cn } from "@/lib/utils";
import { EVENTS, LOCATIONS, trackEvent } from "@/lib/analytics";
import {
  budgetOptions,
  emptyContactForm,
  interestOptions,
  validateContact,
  type ContactErrors,
  type ContactFormValues,
} from "@/lib/contact-schema";

type Status = "idle" | "submitting" | "success";

/** Distinguishes a server-reported failure from a network/fetch failure, for
 *  the `error_type` on `form_error`. Carries no sensitive data of its own. */
class ContactSubmitError extends Error {}

/** Declaration order matches DOM order, so error focus lands on the right field. */
const FIELD_ORDER: (keyof ContactFormValues)[] = [
  "name",
  "company",
  "email",
  "phone",
  "interest",
  "budget",
  "message",
];

export function ContactForm({
  className,
  variant = "full",
  formLocation,
}: {
  className?: string;
  variant?: "full" | "compact";
  /** Where this form instance sits, for the `form_location` analytics param.
   *  Defaults from `variant` when the page does not need to be more specific. */
  formLocation?: string;
}) {
  const [values, setValues] = React.useState<ContactFormValues>(emptyContactForm);
  const [errors, setErrors] = React.useState<ContactErrors>({});
  const [status, setStatus] = React.useState<Status>("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [token, setToken] = React.useState("");

  const turnstileRef = React.useRef<TurnstileHandle>(null);
  // Uncontrolled, so it neither re-renders the form nor counts toward isDirty.
  const honeypotRef = React.useRef<HTMLInputElement>(null);

  // No sensitive data ever goes into these params — only which form, where it
  // sits on the page, and which fields (never their values) failed.
  const formName = variant === "full" ? "contact_full" : "contact_compact";
  const location = formLocation ?? (variant === "full" ? LOCATIONS.contactPage : LOCATIONS.homeContact);

  // Guards `form_start` so it fires once per genuine attempt, not once per
  // keystroke. Reset when the visitor starts a fresh message after a success.
  const hasStartedRef = React.useRef(false);

  const turnstileEnabled = Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  );

  /** A token is single-use, so every completed attempt needs a fresh one. */
  const resetVerification = React.useCallback(() => {
    setToken("");
    turnstileRef.current?.reset();
  }, []);

  const isDirty = React.useMemo(
    () => Object.values(values).some((value) => value.trim() !== ""),
    [values],
  );

  // Warn before losing a part-filled inquiry.
  React.useEffect(() => {
    if (!isDirty || status === "success") return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, status]);

  const update =
    (field: keyof ContactFormValues) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        trackEvent(EVENTS.formStart, { form_name: formName, form_location: location });
      }
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    };

  const focusFirstError = (nextErrors: ContactErrors) => {
    const first = FIELD_ORDER.find((field) => nextErrors[field]);
    if (first) document.getElementById(first)?.focus();
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError(null);
    trackEvent(EVENTS.formSubmitAttempt, { form_name: formName, form_location: location });

    const nextErrors = validateContact(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusFirstError(nextErrors);
      trackEvent(EVENTS.formError, {
        form_name: formName,
        form_location: location,
        error_type: "validation",
        // Field names only, e.g. "email,message" — never the values entered.
        error_fields: Object.keys(nextErrors).join(","),
      });
      return;
    }

    if (turnstileEnabled && !token) {
      setServerError("Complete the verification below to continue.");
      trackEvent(EVENTS.formError, {
        form_name: formName,
        form_location: location,
        error_type: "verification",
      });
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypotRef.current?.value ?? "",
          turnstileToken: token,
        }),
      });

      // The server consumed the token either way, so a retry needs a new one.
      resetVerification();

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string; errors?: ContactErrors }
          | null;

        // Surface per-field errors from the server rather than discarding them.
        if (data?.errors && Object.keys(data.errors).length > 0) {
          setErrors(data.errors);
          focusFirstError(data.errors);
          setStatus("idle");
          trackEvent(EVENTS.formError, {
            form_name: formName,
            form_location: location,
            error_type: "server_validation",
            error_fields: Object.keys(data.errors).join(","),
          });
          return;
        }
        throw new ContactSubmitError(data?.error ?? "Something went wrong. Try again.");
      }

      // The success event GA4 recommends for a captured lead. Placed only on
      // this path, reached only after the server confirms the send, so a
      // Submit click alone — validation failure, a rejected token, a 4xx/5xx —
      // can never produce it, and this is the single call site, so one
      // successful submission is always exactly one `generate_lead`.
      trackEvent(EVENTS.generateLead, { form_name: formName, form_location: location });

      setStatus("success");
      setValues(emptyContactForm);
    } catch (error) {
      setStatus("idle");
      resetVerification();
      setServerError(
        error instanceof Error ? error.message : "Something went wrong. Try again.",
      );
      trackEvent(EVENTS.formError, {
        form_name: formName,
        form_location: location,
        error_type: error instanceof ContactSubmitError ? "server" : "network",
      });
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        role="status"
        aria-live="polite"
        className={cn(
          "flex flex-col items-center justify-center gap-5 rounded-card border border-border bg-surface/60 p-10 text-center sm:p-14",
          className,
        )}
      >
        <span className="inline-flex size-16 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent-secondary">
          <CheckCircle2 className="size-8" aria-hidden />
        </span>
        <h3 className="font-heading text-2xl font-bold tracking-tight text-foreground">
          Message Received
        </h3>
        <p className="max-w-md text-pretty text-sm leading-relaxed text-foreground-muted">
          Thanks for reaching out. A senior strategist will review your details
          and reply within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            // A fresh message is a new attempt, so it earns its own form_start.
            hasStartedRef.current = false;
            setStatus("idle");
          }}
          className="mt-1 inline-flex h-11 items-center rounded-input border border-border-strong px-6 font-heading text-sm font-semibold text-foreground transition-[border-color,background-color] duration-300 hover:border-accent/50 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Send Another Message
        </button>
      </motion.div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className={cn(
        "relative overflow-hidden rounded-card border border-border bg-surface/50 p-6 sm:p-8 lg:p-10",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
      />

      {/*
       * Honeypot. Positioned off-screen rather than display:none, which is the
       * pattern bots check for. aria-hidden plus tabIndex -1 keep it out of the
       * accessibility tree and tab order, so no real user can reach it — they
       * would otherwise have their message silently dropped.
       */}
      <div
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="name"
            label="Full Name"
            required
            error={errors.name}
            value={values.name}
            onChange={update("name")}
            placeholder="e.g. Jane Okafor…"
            autoComplete="name"
          />
          <Field
            id="company"
            label="Company"
            error={errors.company}
            value={values.company}
            onChange={update("company")}
            placeholder="e.g. Northwind Logistics…"
            autoComplete="organization"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="email"
            label="Work Email"
            type="email"
            inputMode="email"
            required
            error={errors.email}
            value={values.email}
            onChange={update("email")}
            placeholder="e.g. jane@northwind.com…"
            autoComplete="email"
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
          />
          <Field
            id="phone"
            label="Phone"
            type="tel"
            inputMode="tel"
            error={errors.phone}
            value={values.phone}
            onChange={update("phone")}
            placeholder="e.g. +1 302 555 0142…"
            autoComplete="tel"
            spellCheck={false}
          />
        </div>

        {variant === "full" && (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              id="interest"
              label="Primary Interest"
              value={values.interest}
              onChange={update("interest")}
              placeholder="Select a service…"
              options={interestOptions}
            />
            <SelectField
              id="budget"
              label="Estimated Budget"
              value={values.budget}
              onChange={update("budget")}
              placeholder="Select a range…"
              options={budgetOptions}
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="message">
            Project Details{" "}
            <span aria-hidden className="text-accent-secondary">
              *
            </span>
          </Label>
          <Textarea
            id="message"
            name="message"
            required
            aria-required="true"
            rows={variant === "full" ? 5 : 4}
            value={values.message}
            onChange={update("message")}
            placeholder="What are you trying to build, automate, or improve?…"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          <FieldError id="message-error" message={errors.message} />
        </div>

        <Turnstile
          ref={turnstileRef}
          onVerify={setToken}
          onExpire={() => setToken("")}
          className="[&>*]:!max-w-full"
        />

        <p aria-live="polite" className="sr-only">
          {serverError ?? ""}
        </p>
        {serverError && (
          <p className="rounded-input border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {serverError}
          </p>
        )}

        <div className="mt-1 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[260px] text-xs leading-relaxed text-foreground-muted/70">
            We only use your details to reply to this inquiry.
          </p>
          <button
            type="submit"
            disabled={status === "submitting"}
            className="group inline-flex h-13 w-full items-center justify-center gap-2 rounded-input bg-accent px-8 font-heading text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(30,123,255,0.85)] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-accent-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60 sm:w-auto"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              <>
                Send Message
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-accent-secondary">
            {" "}
            *
          </span>
        )}
      </Label>
      <Input
        id={id}
        name={id}
        required={required}
        aria-required={required || undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function SelectField({
  id,
  label,
  placeholder,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Select id={id} name={id} {...props}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
          aria-hidden
        />
      </div>
    </div>
  );
}

/** Cross-fades rather than animating height, which would reflow the form. */
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE }}
          className="text-xs text-red-400"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
