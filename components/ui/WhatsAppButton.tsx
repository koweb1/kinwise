"use client";

import { useId, useRef, useState } from "react";
import gsap from "gsap";
import { FaWhatsapp } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import ServiceBudgetFields, { FIELD_CLASS } from "@/components/ui/ServiceBudgetFields";
import { buildWhatsAppUrl, type ServiceId } from "@/lib/contact";

type Props = {
  children: React.ReactNode;
  className?: string;
};

type Errors = { name?: string; services?: string };

export default function WhatsAppButton({ children, className }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [services, setServices] = useState<ServiceId[]>([]);
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const open = () => {
    const dialog = dialogRef.current;
    const inner = innerRef.current;
    if (!dialog || !inner) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    gsap.fromTo(
      inner,
      { y: 40, scale: 0.95, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "expo.out" }
    );
  };

  const close = () => {
    const dialog = dialogRef.current;
    const inner = innerRef.current;
    if (!dialog || !inner || !dialog.open) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(inner, {
      y: 30,
      scale: 0.97,
      autoAlpha: 0,
      duration: reduce ? 0 : 0.35,
      ease: "power2.in",
      onComplete: () => dialog.close(),
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const next: Errors = {};
    if (name.trim().length < 2) next.name = "Please tell me your name.";
    if (services.length === 0) next.services = "Choose at least one service.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    // Opens WhatsApp with the message already typed in. They only press send.
    window.open(
      buildWhatsAppUrl({ name, services, budget, message }),
      "_blank",
      "noopener,noreferrer"
    );
    close();
  };

  return (
    <>
      <button type="button" onClick={open} aria-haspopup="dialog" className={className}>
        {children}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className="m-auto w-[min(92vw,34rem)] max-w-none overflow-visible border-0 bg-transparent p-0 text-white backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        <div
          ref={innerRef}
          className="relative max-h-[90svh] overflow-y-auto rounded-[2rem] bg-graphite p-6 opacity-0 ring-1 ring-white/10 sm:p-8"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-white/15 text-lg text-white transition-colors duration-300 hover:border-volt hover:text-volt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
          >
            <FiX aria-hidden="true" />
          </button>

          <span className="grid size-14 place-items-center rounded-full bg-[#25d366] text-3xl text-ink">
            <FaWhatsapp aria-hidden="true" />
          </span>
          <h2 id={titleId} className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
            Message me on WhatsApp
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Tell me a little about your project. I’ll open the chat with everything already
            written out, and you just press send.
          </p>

          <form onSubmit={submit} noValidate className="mt-6 space-y-6">
            <div>
              <label htmlFor="wa-name" className="text-sm font-medium text-white">
                Your name
              </label>
              <input
                id="wa-name"
                type="text"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "wa-name-error" : undefined}
                placeholder="Your name"
                className={`${FIELD_CLASS} mt-2`}
              />
              {errors.name && (
                <p id="wa-name-error" role="alert" className="mt-2 text-sm text-red-300">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <ServiceBudgetFields
                idPrefix="wa"
                services={services}
                budget={budget}
                onServicesChange={setServices}
                onBudgetChange={setBudget}
                error={errors.services}
              />
            </div>

            <div>
              <label htmlFor="wa-message" className="text-sm font-medium text-white">
                A few details <span className="font-normal text-white/50">Optional</span>
              </label>
              <textarea
                id="wa-message"
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What would you like to create?"
                className={`${FIELD_CLASS} mt-2 resize-y`}
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#25d366] px-6 py-4 text-base font-semibold text-ink transition-transform duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366]"
            >
              <FaWhatsapp className="text-xl" aria-hidden="true" />
              Continue to WhatsApp
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}