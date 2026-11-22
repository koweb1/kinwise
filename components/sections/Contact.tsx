"use client";

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FiArrowUp, FiMail } from "react-icons/fi";
import ContactForm from "@/components/ui/ContactForm";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { CONTACT_EMAIL, SOCIALS, WHATSAPP_DISPLAY } from "@/lib/contact";

gsap.registerPlugin(ScrollTrigger);

const HEADING = [
  { text: "Have" },
  { text: "an" },
  { text: "idea?" },
  { text: "Let’s" },
  { text: "make" },
  { text: "it" },
  { text: "happen.", marker: true },
];

const WORDMARK = "KINWISE".split("");

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Instagram: <FaInstagram />,
  TikTok: <FaTiktok />,
  Facebook: <FaFacebookF />,
};

const FOCUS_INK =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      // 1. The lime card opens up as you scroll into it
      const finale = section.querySelector<HTMLElement>("[data-finale]");
      if (finale && !reduce) {
        gsap.fromTo(
          finale,
          { scale: 0.92, transformOrigin: "50% 100%" },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: finale, start: "top bottom", end: "top 30%", scrub: true },
          }
        );
      }

      // 2. Heading, marker, text and the direct channels
      const intro = section.querySelector("[data-intro]");
      if (intro) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: intro, start: "top 75%" },
          })
          .fromTo(q("[data-dash]"), { scaleX: 0 }, { scaleX: 1, duration: d(0.6) })
          .fromTo(
            q("[data-label-text]"),
            { autoAlpha: 0, x: -12 },
            { autoAlpha: 1, x: 0, duration: d(0.6) },
            0
          )
          .fromTo(
            q("[data-word]"),
            { yPercent: 110, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: d(0.9), stagger: reduce ? 0 : 0.07 },
            0.1
          )
          .fromTo(
            q("[data-marker]"),
            { scaleX: 0 },
            { scaleX: 1, duration: d(0.7), ease: "power3.inOut", transformOrigin: "left center" },
            "-=0.35"
          )
          .fromTo(
            q("[data-fade]"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: d(0.8), stagger: reduce ? 0 : 0.12 },
            "-=0.5"
          );
      }

      // 3. The form card
      const formCard = section.querySelector<HTMLElement>("[data-form-card]");
      if (formCard) {
        gsap.fromTo(
          formCard,
          { y: 50, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: d(1),
            ease: "power3.out",
            scrollTrigger: { trigger: formCard, start: "top 90%" },
          }
        );
      }

      // 4. The footer row, then the giant wordmark rises letter by letter
      const footer = section.querySelector<HTMLElement>("[data-footer]");
      if (footer) {
        gsap.fromTo(
          footer,
          { y: 24, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: d(0.8),
            ease: "power3.out",
            scrollTrigger: { trigger: footer, start: "top 95%" },
          }
        );
      }

      const wordmark = section.querySelector<HTMLElement>("[data-wordmark]");
      if (wordmark) {
        gsap.fromTo(
          q("[data-letter]"),
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: d(1.2),
            stagger: reduce ? 0 : 0.07,
            ease: "power4.out",
            scrollTrigger: { trigger: wordmark, start: "top 98%" },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-heading"
      className="relative px-2 pb-2 pt-8 sm:px-3 sm:pb-3"
    >
      <div
        data-finale
        className="relative overflow-hidden rounded-[2rem] bg-volt text-ink sm:rounded-[3rem] lg:rounded-[4rem]"
      >
        <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24 lg:px-10 lg:pt-32">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
            {/* Heading and direct channels */}
            <div data-intro>
              <p className="flex items-center gap-3 text-sm text-ink/70">
                <span data-dash aria-hidden="true" className="h-[2px] w-5 origin-left bg-ink" />
                <span data-label-text className="opacity-0">
                  Let’s work together
                </span>
              </p>

              <h2
                id="contact-heading"
                className="mt-5 text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[1.04] tracking-tight [word-spacing:0.08em]"
              >
                {HEADING.map((item, i) => (
                  <Fragment key={i}>
                    <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
                      <span
                        data-word
                        className={`invisible relative isolate inline-block ${
                          item.marker ? "px-[0.12em] text-volt" : ""
                        }`}
                      >
                        {item.marker && (
                          <span
                            data-marker
                            aria-hidden="true"
                            className="absolute inset-x-0 inset-y-[0.05em] -z-10 rounded-[0.18em] bg-ink"
                          />
                        )}
                        {item.text}
                      </span>
                    </span>{" "}
                  </Fragment>
                ))}
              </h2>

              <p data-fade className="invisible mt-6 max-w-md text-lg leading-relaxed text-ink/75">
                Got a project in mind? Let’s create something worth remembering.
              </p>

              {/* WhatsApp: the main call to action */}
              <div
                data-fade
                className="mt-10 rounded-[1.75rem] bg-ink p-6 text-white opacity-0 sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-[#25d366] text-3xl text-ink">
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[#25d366]/40 motion-safe:animate-ping"
                    />
                    <FaWhatsapp className="relative" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                      Prefer to chat?
                    </p>
                    <p className="text-sm text-white/70">{WHATSAPP_DISPLAY}</p>
                  </div>
                </div>

                <WhatsAppButton className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#25d366] px-6 py-4 text-base font-semibold text-ink transition-transform duration-300 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25d366] sm:w-auto">
                  <FaWhatsapp className="text-xl" aria-hidden="true" />
                  Chat on WhatsApp
                </WhatsAppButton>
              </div>

              <a
                data-fade
                href={`mailto:${CONTACT_EMAIL}`}
                className={`mt-6 inline-flex items-center gap-3 font-medium opacity-0 transition-opacity duration-300 hover:underline ${FOCUS_INK}`}
              >
                <span className="grid size-11 place-items-center rounded-full border border-ink/30 text-lg">
                  <FiMail aria-hidden="true" />
                </span>
                {CONTACT_EMAIL}
              </a>
            </div>

            {/* The form */}
            <div
              data-form-card
              className="relative self-start rounded-[2rem] bg-graphite p-5 text-white opacity-0 sm:p-8"
            >
              <ContactForm />
            </div>
          </div>

          {/* Footer */}
          <footer
            data-footer
            className="mt-16 flex flex-col gap-6 border-t border-ink/20 pt-8 opacity-0 sm:flex-row sm:items-center sm:justify-between lg:mt-24"
          >
            <p className="font-medium">Ideas deserve to be seen differently.</p>

            <div className="flex items-center gap-3">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Kinwise on ${social.label}`}
                  className={`grid size-11 place-items-center rounded-full border border-ink/30 text-lg transition-colors duration-300 hover:bg-ink hover:text-volt ${FOCUS_INK}`}
                >
                  {SOCIAL_ICONS[social.label]}
                </a>
              ))}

              <Link
                href="/#home"
                aria-label="Back to the top"
                className={`ml-2 grid size-11 place-items-center rounded-full bg-ink text-lg text-volt transition-transform duration-300 hover:-translate-y-1 ${FOCUS_INK}`}
              >
                <FiArrowUp aria-hidden="true" />
              </Link>
            </div>
          </footer>

          <p className="mt-6 text-sm text-ink/70">© 2026 Kinwise. All rights reserved.</p>
        </div>

        {/* Giant wordmark */}
        <p
          data-wordmark
          aria-hidden="true"
          className="mt-10 select-none overflow-hidden px-2 pt-[0.05em] text-center text-[clamp(4.5rem,21vw,19rem)] font-semibold leading-[0.8] tracking-tighter text-ink sm:mt-14"
        >
          {WORDMARK.map((letter, i) => (
            <span key={i} data-letter className="inline-block">
              {letter}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}