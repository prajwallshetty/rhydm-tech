"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { submitContact } from "@/app/(disposal)/disposal/contact/actions";
import { Button } from "@/components/ui/button";
import {
  TOPIC_OPTIONS,
  contactSchema,
  type ContactInput,
} from "@/lib/validation/contact";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-brand";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "pickup" },
  });

  async function onSubmit(values: ContactInput) {
    setFormError(null);
    const result = await submitContact(values);

    if (result.ok) {
      setSubmitted(true);
      reset();
      return;
    }

    setFormError(result.error);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-10 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-muted text-brand">
          <CheckCircle2 className="size-6" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 text-xl font-medium">Enquiry received</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          A specialist will be in touch within one business day. For urgent
          collections, call us directly.
        </p>
        <Button
          variant="outline"
          className="mt-7"
          onClick={() => setSubmitted(false)}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-2xl border border-border/80 bg-card p-7 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message} htmlFor="name" required>
          <input
            id="name"
            autoComplete="name"
            className={fieldClass}
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field
          label="Work email"
          error={errors.email?.message}
          htmlFor="email"
          required
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={fieldClass}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Phone" error={errors.phone?.message} htmlFor="phone">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={fieldClass}
            {...register("phone")}
          />
        </Field>

        <Field label="Company" error={errors.company?.message} htmlFor="company">
          <input
            id="company"
            autoComplete="organization"
            className={fieldClass}
            {...register("company")}
          />
        </Field>
      </div>

      <Field label="How can we help?" error={errors.topic?.message} htmlFor="topic">
        <select id="topic" className={fieldClass} {...register("topic")}>
          {TOPIC_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Details"
        error={errors.message?.message}
        htmlFor="message"
        required
        hint="Rough asset counts, locations and any compliance requirements help us respond accurately."
      >
        <textarea
          id="message"
          rows={5}
          className={cn(fieldClass, "resize-y")}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
      </Field>

      {formError && (
        <p role="alert" className="text-sm text-destructive">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        {isSubmitting ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-brand">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
