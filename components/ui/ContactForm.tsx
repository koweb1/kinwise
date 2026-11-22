"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import ServiceBudgetFields, { FIELD_CLASS } from "@/components/ui/ServiceBudgetFields";
import { buildWhatsAppUrl, type ServiceId } from "@/lib/contact";

type Errors = { name?: string; email?: string; services?: string; message?: string };
type Status = "idle" | "sending" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt";

export default function ContactForm() {
  const successRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [services, setServices] = useState<ServiceId[]>([]);
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  // The check mark draws itself once the message is sent
  useEffect(() => {
    if (status !== "success") return;
    const container = successRef.current;
    if (!container) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = gsap.utils.selector(container);

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          q("[data-draw]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: reduce ? 0 : 0.9, stagger: reduce ? 0 : 0.35, ease: "power2.inOut" }
        )
        .fromTo(
          q("[data-rise]"),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: reduce ? 0 : 0.6, stagger: reduce ? 0 : 0.1 },
          0.3
        );
    }, container);

    return () => ctx.revert();
  }, [status]);

  const validate = (): Errors => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Please tell me your name.";
    if (!EMAIL_RE.test(email.trim())) next.email = "Please enter a valid email address.";
    if (services.length === 0) next.services = "Choose at least one service.";
    if (message.trim().length < 10) next.message = "Tell me a little more about your project.";
    return next;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "sending") return;

    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = (["name", "email", "message"] as const).find((key) => next[key]);
      if (first) document.getElementById(`contact-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          services,
          // The budget is only sent when exactly one service is chosen
          budget: services.length === 1 ? budget : "",
          message,
          website: honeypot,
          elapsed: Date.now() - startedAt.current,
        }),
      });

      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setServerError(data?.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setServerError("I couldn’t reach the server. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const reset = () => {
    setName("");
    setEmail("");
    setServices([]);
    setBudget("");
    setMessage("");
    setErrors({});
    setServerError("");
    startedAt.current = Date.now();
    setStatus("idle");
  };

  if (status === "success") {
    return (
      <div ref={successRef} className="py-10 text-center sm:py-14" role="status">
        <svg viewBox="0 0 64 64" fill="none" className="mx-auto size-24" aria-hidden="true">
          <circle
            data-draw
            pathLength={1}
            strokeDasharray="1 2"
            cx="32"
            cy="32"
            r="28"
            className="stroke-volt"
            strokeWidth="3"
          />
          <path
            data-draw
            pathLength={1}
            strokeDasharray="1 2"
            d="M20 33 L29 42 L45 24"
            className="stroke-volt"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 data-rise className="mt-6 text-3xl font-semibold tracking-tight">
          Message sent.
        </h3>
        <p data-rise className="mx-auto mt-3 max-w-sm text-white/70">
          Thanks for reaching out. I’ve got your message and I’ll reply to your email.
        </p>
        <button
          data-rise
          type="button"
          onClick={reset}
          className={`mt-8 rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors duration-300 hover:border-volt hover:text-volt ${FOCUS}`}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-white">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            placeholder="Your name"
            className={`${FIELD_CLASS} mt-2`}
          />
          {errors.name && (
            <p id="contact-name-error" role="alert" className="mt-2 text-sm text-red-300">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="text-sm font-medium text-white">
            Your email
          </label>
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            placeholder="you@example.com"
            className={`${FIELD_CLASS} mt-2`}
          />
          {errors.email && (
            <p id="contact-email-error" role="alert" className="mt-2 text-sm text-red-300">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <ServiceBudgetFields
          idPrefix="contact"
          services={services}
          budget={budget}
          onServicesChange={setServices}
          onBudgetChange={setBudget}
          error={errors.services}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-white">
          About your project
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          placeholder="What would you like to create?"
          className={`${FIELD_CLASS} mt-2 resize-y`}
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="mt-2 text-sm text-red-300">
            {errors.message}
          </p>
        )}
      </div>

      {/* Spam trap: people never see this field, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-2xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {serverError} You can also message me on WhatsApp.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status === "sending"}
          className={`group inline-flex items-center justify-center gap-3 rounded-full bg-volt py-1.5 pl-7 pr-1.5 text-base font-semibold text-ink transition-opacity duration-300 disabled:opacity-60 ${FOCUS}`}
        >
          {status === "sending" ? "Sending…" : "Start a Project"}
          <span className="grid size-11 place-items-center rounded-full bg-ink text-volt transition-transform duration-300 group-hover:rotate-45">
            <FiArrowUpRight aria-hidden="true" />
          </span>
        </button>

        <a
          href={buildWhatsAppUrl({ name, services, budget, message })}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-[#25d366]/50 px-6 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#25d366] hover:text-ink ${FOCUS}`}
        >
          <FaWhatsapp className="text-lg" aria-hidden="true" />
          Send this on WhatsApp instead
        </a>
      </div>
    </form>
  );
}