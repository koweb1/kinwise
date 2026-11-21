"use client";

import { Fragment, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sparkle from "@/components/ui/Sparkle";

gsap.registerPlugin(ScrollTrigger);

const HEADING = [
  { text: "From" },
  { text: "idea" },
  { text: "to" },
  { text: "impact.", marker: true },
];

const STEPS = [
  { number: "01", title: "Discover", description: "Understanding the idea and the vision." },
  { number: "02", title: "Create", description: "Turning concepts into visual experiences." },
  { number: "03", title: "Refine", description: "Perfecting the details." },
  { number: "04", title: "Deliver", description: "Bringing the final vision to life." },
];

const BURST_COUNT = 8;

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      const steps = gsap.utils.toArray<HTMLElement>("[data-step]", section);
      const list = section.querySelector<HTMLElement>("[data-list]");
      const progress = section.querySelector<HTMLElement>("[data-progress]");
      const dot = section.querySelector<HTMLElement>("[data-dot]");
      const counter = section.querySelector<HTMLElement>("[data-counter]");
      const marker = section.querySelector<HTMLElement>("[data-marker]");

      // 1. Label, heading and marker
      const intro = section.querySelector("[data-intro]");
      if (intro) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: intro, start: "top 80%" },
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
            { yPercent: 0, autoAlpha: 1, duration: d(0.9), stagger: reduce ? 0 : 0.09 },
            0.1
          )
          .fromTo(
            q("[data-marker]"),
            { scaleX: 0 },
            { scaleX: 1, duration: d(0.7), ease: "power3.inOut", transformOrigin: "left center" },
            "-=0.35"
          )
          .fromTo(
            q("[data-counter-wrap]"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: d(0.8) },
            "-=0.5"
          );
      }

      // 2. Each step rises into view: the number through a mask, then the text
      steps.forEach((step) => {
        const number = step.querySelector("[data-step-number]");
        const texts = step.querySelectorAll("[data-step-text]");

        gsap
          .timeline({
            defaults: { ease: "power4.out" },
            scrollTrigger: { trigger: step, start: "top 85%" },
          })
          .fromTo(
            number,
            { yPercent: 100, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: d(1.1) },
            0
          )
          .fromTo(
            texts,
            { y: 26, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: d(0.8),
              stagger: reduce ? 0 : 0.1,
              ease: "power3.out",
            },
            0.25
          );
      });

      // 3. Reduced motion: everything lit, line full, no scrubbing
      if (reduce) {
        steps.forEach((step) => step.setAttribute("data-active", "true"));
        if (progress) gsap.set(progress, { scaleY: 1 });
        if (dot) gsap.set(dot, { autoAlpha: 0 });
        if (counter) gsap.set(counter, { yPercent: -75 });
        return;
      }

      // 4. The payoff when the last step lights up
      const sparks = gsap.utils.toArray<HTMLElement>("[data-burst-spark]", section);
      const burst = gsap.timeline({ paused: true });
      sparks.forEach((spark, n) => {
        const angle = (n / sparks.length) * Math.PI * 2 - Math.PI / 2;
        const distance = 70 + (n % 2) * 32;
        burst
          .fromTo(
            spark,
            { x: 0, y: 0, scale: 0, rotation: 0, autoAlpha: 1 },
            {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: 1,
              rotation: 90,
              duration: 0.7,
              ease: "power3.out",
            },
            0
          )
          .to(spark, { scale: 0, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, 0.55);
      });
      if (marker) {
        burst.fromTo(
          marker,
          { boxShadow: "0 0 0 0px rgba(217,254,27,0.55)" },
          { boxShadow: "0 0 0 22px rgba(217,254,27,0)", duration: 1, ease: "power2.out" },
          0
        );
      }

      // 5. Which step is lit, and the counter that follows it
      let current = -1;
      const setActive = (index: number) => {
        if (index === current) return;
        current = index;

        steps.forEach((step, n) => step.setAttribute("data-active", String(n === index)));

        if (counter) {
          gsap.to(counter, {
            yPercent: -(100 / steps.length) * index,
            duration: 0.7,
            ease: "power3.out",
            overwrite: true,
          });
        }
        if (index === steps.length - 1) burst.restart();
      };

      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
      });

      // 6. The lime line draws itself and the dot rides along it
      if (list && progress) {
        gsap.fromTo(
          progress,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: list, start: "top 55%", end: "bottom 55%", scrub: true },
          }
        );
      }
      if (list && dot) {
        gsap.fromTo(
          dot,
          { top: "0%" },
          {
            top: "100%",
            ease: "none",
            scrollTrigger: { trigger: list, start: "top 55%", end: "bottom 55%", scrub: true },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      aria-labelledby="process-heading"
      className="relative overflow-x-clip px-4 pb-24 pt-8 sm:px-6 sm:pb-32 lg:px-10 lg:pb-40"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-10">
        {/* Heading and counter (pinned on desktop) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <div data-intro>
              <p className="flex items-center gap-3 text-sm text-white/70">
                <span data-dash aria-hidden="true" className="h-[2px] w-5 origin-left bg-volt" />
                <span data-label-text className="opacity-0">
                  Process
                </span>
              </p>

              <h2
                id="process-heading"
                className="mt-5 text-[clamp(2.5rem,6.4vw,4.75rem)] font-semibold leading-[1.04] tracking-tight [word-spacing:0.08em] lg:text-[clamp(2.75rem,4.4vw,4.25rem)]"
              >
                {HEADING.map((item, i) => (
                  <Fragment key={i}>
                    <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
                      <span
                        data-word
                        className={`invisible relative isolate inline-block ${
                          item.marker ? "px-[0.12em] text-ink" : ""
                        }`}
                      >
                        {item.marker && (
                          <span
                            data-marker
                            aria-hidden="true"
                            className="absolute inset-x-0 inset-y-[0.05em] -z-10 rounded-[0.18em] bg-volt"
                          />
                        )}
                        {item.text}
                      </span>
                    </span>{" "}
                  </Fragment>
                ))}
              </h2>
            </div>

            <div
              data-counter-wrap
              aria-hidden="true"
              className="invisible mt-12 hidden items-end gap-3 lg:flex"
            >
              <div className="h-[1em] overflow-hidden text-[5.5rem] font-semibold leading-none tracking-tight tabular-nums text-volt">
                <div data-counter className="will-change-transform">
                  {STEPS.map((step) => (
                    <span key={step.number} className="block h-[1em]">
                      {step.number}
                    </span>
                  ))}
                </div>
              </div>
              <span className="pb-2 text-xl text-white/50">/ 04</span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="lg:col-span-7">
          <div data-list className="relative pl-8 sm:pl-12 lg:pl-14">
            <span aria-hidden="true" className="absolute left-0 top-0 h-full w-[2px] bg-white/15" />
            <span
              data-progress
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-[2px] origin-top bg-volt"
            />
            <span
              data-dot
              aria-hidden="true"
              className="absolute left-[1px] top-0 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt shadow-[0_0_24px_rgba(217,254,27,0.7)] ring-4 ring-ink"
            />

            <ol aria-label="My creative process">
              {STEPS.map((step, i) => (
                <li
                  key={step.number}
                  data-step
                  data-active="false"
                  className="group py-10 first:pt-2 last:pb-2 lg:py-20 lg:first:pt-6 lg:last:pb-6"
                >
                  <div className="relative text-[clamp(6rem,24vw,9rem)] lg:text-[clamp(8rem,11vw,11rem)]">
                    <div className="overflow-hidden py-[0.04em]">
                      <span
                        data-step-number
                        aria-hidden="true"
                        className="invisible block bg-clip-text font-semibold leading-none tracking-tight text-transparent transition-[background-position,-webkit-text-stroke-color] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] [-webkit-text-stroke:2px_rgba(255,255,255,0.3)] [background-image:linear-gradient(to_top,#d9fe1b_50%,transparent_50%)] [background-position:0_0] [background-size:100%_200%] group-data-[active=true]:[-webkit-text-stroke-color:#d9fe1b] group-data-[active=true]:[background-position:0_100%]"
                      >
                        {step.number}
                      </span>
                    </div>

                    {i === STEPS.length - 1 && (
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute left-[1.35em] top-1/2 size-0"
                      >
                        {Array.from({ length: BURST_COUNT }, (_, n) => (
                          <span
                            key={n}
                            data-burst-spark
                            className="invisible absolute -ml-3 -mt-3 size-6 text-volt sm:size-7"
                          >
                            <Sparkle className="size-full" />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <h3
                    data-step-text
                    className="invisible mt-4 text-3xl font-semibold tracking-tight text-white/45 transition-colors duration-700 group-data-[active=true]:text-white sm:text-4xl lg:text-5xl"
                  >
                    {step.title}
                  </h3>
                  <p
                    data-step-text
                    className="invisible mt-3 max-w-md text-base leading-relaxed text-white/50 transition-colors duration-700 group-data-[active=true]:text-white/75 sm:text-lg"
                  >
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}