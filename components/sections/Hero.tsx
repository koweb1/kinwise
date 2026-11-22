"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { FiArrowUpRight } from "react-icons/fi";

type HeadlineItem = { text: string; marker?: boolean } | { br: true };

const HEADLINE: HeadlineItem[] = [
  { text: "Making" },
  { text: "ideas" },
  { br: true },
  { text: "impossible", marker: true },
  { text: "to" },
  { text: "ignore." },
];

const SPARKLES = [
  "left-[14%] top-[10%] size-5 lg:size-7",
  "left-[84%] top-[14%] size-4 lg:size-6",
  "left-[8%] top-[38%] size-3 lg:size-4",
];

const FOCUS_ON_DARK =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const FOCUS_ON_LIGHT =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

function Starburst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="50" y1="6" x2="50" y2="30" transform={`rotate(${i * 30} 50 50)`} />
        ))}
      </g>
    </svg>
  );
}

function Sparks({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 38 L20 30" />
      <path d="M10 22 L28 19" />
      <path d="M18 8 L34 10" />
    </svg>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0Z" />
    </svg>
  );
}

function LoopArrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 130 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path
        data-draw
        pathLength={1}
        strokeDasharray="1 2"
        strokeDashoffset={1}
        d="M8 12 C 6 56, 52 70, 52 42 C 52 20, 28 30, 38 56 C 48 82, 92 88, 116 72"
      />
      <path
        data-draw
        pathLength={1}
        strokeDasharray="1 2"
        strokeDashoffset={1}
        d="M104 62 L117 72 L102 84"
      />
    </svg>
  );
}

export default function Hero() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    let cleanupParallax: (() => void) | undefined;

    const setupParallax = () => {
      if (reduce || !finePointer) return;
      const avatar = card.querySelector<HTMLElement>("[data-avatar]");
      const circle = card.querySelector<HTMLElement>("[data-circle]");
      if (!avatar || !circle) return;

      const avatarX = gsap.quickTo(avatar, "x", { duration: 0.8, ease: "power3.out" });
      const avatarY = gsap.quickTo(avatar, "y", { duration: 0.8, ease: "power3.out" });
      const circleX = gsap.quickTo(circle, "x", { duration: 1, ease: "power3.out" });
      const circleY = gsap.quickTo(circle, "y", { duration: 1, ease: "power3.out" });

      const onMove = (e: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        avatarX(nx * 24);
        avatarY(ny * 12);
        circleX(nx * -12);
        circleY(ny * -8);
      };
      const onLeave = () => {
        avatarX(0);
        avatarY(0);
        circleX(0);
        circleY(0);
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      cleanupParallax = () => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      };
    };

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(card);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        q("[data-word]"),
        { yPercent: 110, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: d(0.9), stagger: reduce ? 0 : 0.09 }
      )
        .fromTo(
          q("[data-marker]"),
          { scaleX: 0 },
          { scaleX: 1, duration: d(0.7), ease: "power3.inOut", transformOrigin: "left center" },
          "-=0.35"
        )
        .fromTo(
          q("[data-circle]"),
          { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 60%" },
          { scale: 1, autoAlpha: 1, duration: d(1), ease: "expo.out" },
          0.2
        )
        .fromTo(
          q("[data-avatar]"),
          { y: 80, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: d(1), ease: "power4.out" },
          0.45
        )
        .fromTo(
          q("[data-fade]"),
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: d(0.7), stagger: reduce ? 0 : 0.1 },
          0.9
        )
        .fromTo(
          q("[data-badge]"),
          { scale: 0.5, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: d(0.8), ease: "back.out(1.8)" },
          1.1
        )
        .fromTo(
          q("[data-burst]"),
          { scale: 0, rotation: -90, autoAlpha: 0 },
          { scale: 1, rotation: 0, autoAlpha: 1, duration: d(0.9), ease: "back.out(2)" },
          0.6
        )
        .fromTo(
          q("[data-draw]"),
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: d(1.1), ease: "power2.inOut", stagger: reduce ? 0 : 0.5 },
          1.2
        );

      tl.eventCallback("onComplete", setupParallax);

      // Sparkles pop in, then twinkle
      q("[data-sparkle]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { scale: 0, autoAlpha: 0 },
          { scale: 1, autoAlpha: 1, duration: d(0.6), delay: d(1 + i * 0.15), ease: "back.out(2)" }
        );
        if (!reduce) {
          gsap.to(el, {
            scale: 0.7,
            rotation: 45,
            duration: 1.4 + i * 0.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 2.2 + i * 0.15,
          });
        }
      });

      // Continuous motion
      if (!reduce) {
        gsap.to(q("[data-burst]"), {
          rotation: 360,
          duration: 24,
          ease: "none",
          repeat: -1,
          delay: 1.8,
        });
        gsap.to(q("[data-badge-ring]"), {
          rotation: 360,
          svgOrigin: "100 100",
          duration: 16,
          ease: "none",
          repeat: -1,
        });
      }
    }, card);

    return () => {
      cleanupParallax?.();
      ctx.revert();
    };
  }, []);

  return (
    <section id="home" aria-label="Introduction" className="p-2 sm:p-3">
      <div
        ref={cardRef}
        className="relative flex min-h-[46rem] flex-col items-center overflow-hidden rounded-t-[1.75rem] rounded-b-[2.75rem] bg-paper text-ink sm:min-h-[48rem] sm:rounded-t-[2.5rem] sm:rounded-b-[3.5rem] md:min-h-[52rem] lg:min-h-[max(48rem,calc(100svh_-_1.5rem))] lg:rounded-b-[4.5rem]"
      >
        {/* Decorations on the white card */}
        <span
          data-burst
          className="invisible absolute left-[5%] top-[14%] hidden size-12 sm:block lg:size-16"
        >
          <Starburst className="size-full" />
        </span>
        <span data-fade className="invisible absolute right-[6%] top-[14%] hidden w-12 lg:block">
          <Sparks className="w-full" />
        </span>
        <span className="absolute left-[23%] top-[56%] hidden w-24 lg:block">
          <LoopArrow className="w-full" />
        </span>

        {/* Headline */}
        <h1 className="relative z-10 px-5 pt-28 text-center text-[clamp(2.5rem,6.6vw,5.5rem)] font-semibold leading-[1.02] tracking-tight [word-spacing:0.08em] lg:px-10">
          {HEADLINE.map((item, i) =>
            "br" in item ? (
              <br key={i} className="hidden sm:block" />
            ) : (
              <Fragment key={i}>
                <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
                  <span
                    data-word
                    className={`invisible relative isolate inline-block ${
                      item.marker ? "px-[0.12em]" : ""
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
            )
          )}
        </h1>

        <p
          data-fade
          className="invisible relative z-10 mx-auto mt-5 max-w-xs px-5 text-center text-sm leading-relaxed text-ink/70 lg:absolute lg:left-[6%] lg:top-[50%] lg:m-0 lg:max-w-[14rem] lg:px-0 lg:text-left xl:max-w-[16rem]"
        >
          I create visual experiences through graphic design, motion and video —
          helping brands communicate, connect and stand out.
        </p>

        {/* Avatar on a black circle, anchored to the bottom of the card */}
        <div className="absolute inset-x-0 bottom-0 mx-auto w-[20rem] sm:w-[24rem] md:w-[26rem] lg:w-[clamp(20rem,calc((max(48rem,100svh_-_1.5rem)_-_21.5rem)_/_1.14),40rem)]">
          <div
            data-circle
            className="invisible absolute -top-[14%] left-1/2 -ml-[53.5%] aspect-square w-[107%] rounded-full bg-ink"
          />

          {SPARKLES.map((position) => (
            <span
              key={position}
              data-sparkle
              className={`invisible absolute text-volt ${position}`}
            >
              <Sparkle className="size-full" />
            </span>
          ))}

          <div data-avatar className="invisible relative">
            <Image
              src="/avatar-hero.png"
              alt="Kinwise, an illustrated self-portrait in a green hoodie marked Ps and Ae"
              width={1024}
              height={1024}
              sizes="(min-width: 1024px) 40rem, (min-width: 768px) 26rem, 20rem"
              className="block h-auto w-full"
              priority
            />
          </div>
        </div>

        {/* Rotating "work together" badge (tablet and up): glides to the Contact section */}
        <Link
          href="/#contact"
          data-badge
          aria-label="Let’s work together, go to the contact section"
          className={`group invisible absolute right-[4%] top-[42%] z-10 hidden size-28 place-items-center rounded-full bg-ink text-volt md:grid lg:right-[7%] lg:size-36 ${FOCUS_ON_LIGHT}`}
        >
          <svg viewBox="0 0 200 200" className="absolute inset-0 size-full" aria-hidden="true">
            <defs>
              <path
                id="badge-circle"
                d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"
              />
            </defs>
            <g data-badge-ring>
              <text fill="currentColor" fontSize="14" fontWeight="500">
                <textPath href="#badge-circle" textLength="470" lengthAdjust="spacing">
                  LET’S WORK TOGETHER • LET’S CREATE •
                </textPath>
              </text>
            </g>
          </svg>
          <span className="grid size-12 place-items-center rounded-full bg-volt text-ink transition-transform duration-300 group-hover:rotate-45 lg:size-14">
            <FiArrowUpRight className="text-xl" aria-hidden="true" />
          </span>
        </Link>

        {/* Calls to action */}
        <div
          data-fade
          className="invisible absolute inset-x-0 bottom-5 z-20 flex justify-center px-3"
        >
          <div className="flex items-center gap-1 rounded-full bg-ink/90 p-1.5 backdrop-blur-md">
            <Link
              href="/#works"
              className={`rounded-full bg-volt px-3.5 py-3 text-xs font-medium text-ink transition-transform duration-300 hover:scale-[1.04] sm:px-5 sm:text-[13px] ${FOCUS_ON_DARK}`}
            >
              Explore My Work
            </Link>
            <Link
              href="/#contact"
              className={`rounded-full px-3.5 py-3 text-xs font-medium text-white transition-colors duration-300 hover:text-volt sm:px-5 sm:text-[13px] ${FOCUS_ON_DARK}`}
            >
              Let’s Work Together
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}