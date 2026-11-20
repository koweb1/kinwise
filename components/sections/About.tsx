"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiPlay, FiX } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

// Placeholders: set these when the client sends the brand film.
const VIDEO_SRC: string = ""; // e.g. "/videos/kinwise-story.mp4"
const POSTER_SRC: string = ""; // e.g. "/images/story-poster.jpg"

type HeadingWord = { text: string; marker?: boolean };

const HEADING: HeadingWord[] = [
  { text: "A" },
  { text: "little" },
  { text: "about" },
  { text: "the" },
  { text: "creative.", marker: true },
];

const QUOTE_WORDS =
  "Good design isn’t just about looking good. It’s about making people feel something.".split(
    " "
  );
const QUOTE_ACCENT_FROM = QUOTE_WORDS.length - 2;

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt";

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} aria-hidden="true">
      <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0Z" />
    </svg>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogInnerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    let cleanupPlay: (() => void) | undefined;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      // 1. The hero steps back and dims as the About section arrives
      const hero = document.getElementById("home");
      if (hero && !reduce) {
        gsap.to(hero, {
          scale: 0.92,
          opacity: 0.35,
          transformOrigin: "50% 100%",
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }

      // 2. Label, heading, marker and paragraphs
      const intro = section.querySelector("[data-intro]");
      if (intro) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: intro, start: "top 78%" },
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
            q("[data-intro-fade]"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: d(0.8), stagger: reduce ? 0 : 0.12 },
            "-=0.6"
          );
      }

      // 3. Cards wipe open as they enter the screen
      const revealCard = (selector: string, startClip: string) => {
        const card = section.querySelector<HTMLElement>(selector);
        if (!card) return;
        gsap.fromTo(
          card,
          { clipPath: `inset(${startClip} round 2rem)`, autoAlpha: 0 },
          {
            clipPath: "inset(0% 0% 0% 0% round 2rem)",
            autoAlpha: 1,
            duration: d(1.3),
            ease: "expo.out",
            clearProps: "clipPath",
            scrollTrigger: { trigger: card, start: "top 85%" },
          }
        );
      };
      revealCard("[data-video-card]", "100% 0% 0% 0%");
      revealCard("[data-portrait]", "0% 0% 100% 0%");

      // 4. The avatar rises into its card, sparkles pop and twinkle
      const portrait = section.querySelector<HTMLElement>("[data-portrait]");
      const avatar = section.querySelector<HTMLElement>("[data-about-avatar]");
      if (portrait && avatar) {
        gsap.fromTo(
          avatar,
          { y: 70, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: d(1.1),
            delay: d(0.35),
            ease: "power4.out",
            scrollTrigger: { trigger: portrait, start: "top 80%" },
          }
        );
      }

      q("[data-about-sparkle]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { scale: 0, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: d(0.6),
            delay: d(0.8 + i * 0.15),
            ease: "back.out(2)",
            scrollTrigger: { trigger: portrait ?? el, start: "top 80%" },
          }
        );
        if (!reduce) {
          gsap.to(el, {
            scale: 0.7,
            rotation: 45,
            duration: 1.4 + i * 0.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 2 + i * 0.15,
          });
        }
      });

      // 5. Gentle parallax inside the cards
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>("[data-media]", section).forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      }

      // 6. The play button follows the cursor over the video card
      if (!reduce && finePointer) {
        const card = section.querySelector<HTMLElement>("[data-video-card]");
        const play = section.querySelector<HTMLElement>("[data-play]");
        if (card && play) {
          const px = gsap.quickTo(play, "x", { duration: 0.6, ease: "power3.out" });
          const py = gsap.quickTo(play, "y", { duration: 0.6, ease: "power3.out" });

          const onMove = (e: PointerEvent) => {
            const r = card.getBoundingClientRect();
            const limitX = r.width / 2 - 70;
            const limitY = r.height / 2 - 70;
            px(gsap.utils.clamp(-limitX, limitX, e.clientX - r.left - r.width / 2));
            py(gsap.utils.clamp(-limitY, limitY, e.clientY - r.top - r.height / 2));
          };
          const onLeave = () => {
            px(0);
            py(0);
          };

          card.addEventListener("pointermove", onMove);
          card.addEventListener("pointerleave", onLeave);
          cleanupPlay = () => {
            card.removeEventListener("pointermove", onMove);
            card.removeEventListener("pointerleave", onLeave);
          };
        }
      }

      // 7. The quote lights up word by word as you scroll
      const quote = section.querySelector("[data-quote]");
      const words = q("[data-qword]");
      if (quote) {
        if (reduce) {
          gsap.set(words, { opacity: 1 });
        } else {
          gsap.fromTo(
            words,
            { opacity: 0.18 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.1,
              scrollTrigger: {
                trigger: quote,
                start: "top 80%",
                end: "bottom 55%",
                scrub: true,
              },
            }
          );
        }
      }
    }, section);

    return () => {
      cleanupPlay?.();
      ctx.revert();
    };
  }, []);

  const openVideo = () => {
    const dialog = dialogRef.current;
    const inner = dialogInnerRef.current;
    if (!dialog || !inner) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dialog.showModal();
    document.body.style.overflow = "hidden";

    gsap.fromTo(
      inner,
      { y: 40, scale: 0.94, autoAlpha: 0 },
      { y: 0, scale: 1, autoAlpha: 1, duration: reduce ? 0 : 0.6, ease: "expo.out" }
    );

    const playing = videoRef.current?.play();
    playing?.catch(() => {});
  };

  const closeVideo = () => {
    const dialog = dialogRef.current;
    const inner = dialogInnerRef.current;
    if (!dialog || !inner || !dialog.open) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    videoRef.current?.pause();

    gsap.to(inner, {
      y: 30,
      scale: 0.96,
      autoAlpha: 0,
      duration: reduce ? 0 : 0.35,
      ease: "power2.in",
      onComplete: () => dialog.close(),
    });
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className="relative px-4 pb-24 pt-24 sm:px-6 sm:pb-32 sm:pt-32 lg:px-10 lg:pb-40 lg:pt-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* Intro */}
        <div data-intro className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7">
            <p className="flex items-center gap-3 text-sm text-white/70">
              <span data-dash aria-hidden="true" className="h-[2px] w-5 origin-left bg-volt" />
              <span data-label-text className="opacity-0">
                About me
              </span>
            </p>

            <h2
              id="about-heading"
              className="mt-5 text-[clamp(2.5rem,6.4vw,4.75rem)] font-semibold leading-[1.04] tracking-tight [word-spacing:0.08em]"
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
            data-intro-fade
            className="invisible max-w-md space-y-4 text-base leading-relaxed text-white/70 lg:col-span-5 lg:justify-self-end"
          >
            <p>
              I’m Kinwise, a creative designer passionate about turning ideas into
              meaningful visual experiences.
            </p>
            <p>
              From branding and digital graphics to motion and video, I enjoy creating
              visuals that communicate clearly and leave an impression.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-4 sm:gap-5 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          {/* Video card (opens the brand film) */}
          <button
            type="button"
            data-video-card
            onClick={openVideo}
            aria-haspopup="dialog"
            aria-label="Play the Kinwise brand film"
            className={`group relative isolate min-h-[22rem] cursor-pointer overflow-hidden rounded-[2rem] bg-graphite text-left opacity-0 sm:min-h-[28rem] lg:col-span-8 lg:min-h-[34rem] ${FOCUS}`}
          >
            <span data-media className="absolute inset-x-0 -inset-y-[10%]">
              {POSTER_SRC ? (
                <Image
                  src={POSTER_SRC}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover grayscale transition-[filter,transform] duration-700 group-hover:scale-105 group-hover:grayscale-0"
                />
              ) : (
                <>
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[10%] left-1/2 -ml-[35%] aspect-square w-[70%] rounded-full bg-volt/15 blur-3xl transition-opacity duration-700 group-hover:bg-volt/25"
                  />
                </>
              )}
            </span>

            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.65),transparent_60%)]"
            />

            <span className="pointer-events-none absolute inset-0 grid place-items-center">
              <span data-play className="relative grid size-24 place-items-center sm:size-28">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-volt/40 motion-safe:animate-ping"
                />
                <span className="relative grid size-full place-items-center rounded-full bg-volt text-ink transition-transform duration-500 group-hover:scale-110">
                  <FiPlay className="ml-1 fill-current text-3xl" aria-hidden="true" />
                </span>
              </span>
            </span>

            <span className="absolute bottom-5 left-5 sm:bottom-7 sm:left-7">
              <span className="block rounded-md bg-volt px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink sm:text-xs">
                Watch the full story
              </span>
            </span>
          </button>

          {/* Portrait card */}
          <div
            data-portrait
            className="relative isolate min-h-[28rem] overflow-hidden rounded-[2rem] bg-graphite opacity-0 sm:min-h-[32rem] lg:col-span-4 lg:min-h-[34rem]"
          >
            <span data-media className="absolute inset-x-0 -inset-y-[10%]">
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[34%] -ml-[60%] aspect-square w-[120%] rounded-full bg-volt/20 blur-3xl"
              />
            </span>

            <span className="absolute left-5 top-5 z-10 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-xs backdrop-blur-md sm:left-6 sm:top-6">
              <span className="font-medium text-white">Kinwise</span>
              <span className="text-white/60"> · Creative Designer</span>
            </span>

            {[
              "left-[14%] top-[30%] size-4 sm:size-5",
              "left-[82%] top-[22%] size-5 sm:size-6",
              "left-[84%] top-[52%] size-3 sm:size-4",
            ].map((position) => (
              <span
                key={position}
                data-about-sparkle
                className={`invisible absolute text-volt ${position}`}
              >
                <Sparkle className="size-full" />
              </span>
            ))}

            <div
              data-about-avatar
              className="invisible absolute inset-x-0 bottom-0 mx-auto w-[96%]"
            >
              <Image
                src="/avatar-hero.png"
                alt=""
                width={1024}
                height={1024}
                sizes="(min-width: 1024px) 28rem, 90vw"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>

        {/* Belief quote */}
        <div className="mx-auto mt-24 max-w-5xl text-center lg:mt-36">
          <p className="flex items-center justify-center gap-3 text-sm text-white/70">
            <span aria-hidden="true" className="h-[2px] w-5 bg-volt" />
            What I believe
          </p>
          <p
            data-quote
            className="mt-6 text-balance text-[clamp(1.875rem,4.6vw,3.75rem)] font-semibold leading-[1.15] tracking-tight"
          >
            {QUOTE_WORDS.map((word, i) => (
              <Fragment key={i}>
                <span
                  data-qword
                  className={`inline-block ${i >= QUOTE_ACCENT_FROM ? "text-volt" : ""}`}
                >
                  {word}
                </span>{" "}
              </Fragment>
            ))}
          </p>
        </div>
      </div>

      {/* Brand film dialog */}
      <dialog
        ref={dialogRef}
        aria-label="Kinwise brand film"
        onCancel={(e) => {
          e.preventDefault();
          closeVideo();
        }}
        onClose={() => {
          document.body.style.overflow = "";
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeVideo();
        }}
        className="m-auto w-[min(92vw,64rem)] max-w-none overflow-visible border-0 bg-transparent p-0 text-white backdrop:bg-black/85 backdrop:backdrop-blur-sm"
      >
        <div ref={dialogInnerRef} className="relative opacity-0">
          <button
            type="button"
            onClick={closeVideo}
            aria-label="Close video"
            className={`absolute -top-14 right-0 grid size-11 place-items-center rounded-full bg-volt text-xl text-ink transition-transform duration-200 hover:scale-105 ${FOCUS}`}
          >
            <FiX aria-hidden="true" />
          </button>

          <div className="aspect-video overflow-hidden rounded-2xl bg-graphite ring-1 ring-white/10">
            {VIDEO_SRC ? (
              <video
                ref={videoRef}
                src={VIDEO_SRC}
                controls
                playsInline
                className="size-full object-contain"
              />
            ) : (
              <div className="grid size-full place-items-center p-6 text-center">
                <div>
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-volt text-ink">
                    <FiPlay className="ml-1 fill-current text-2xl" aria-hidden="true" />
                  </span>
                  <p className="mt-5 text-lg font-medium">The brand film is on its way.</p>
                  <p className="mt-1 text-sm text-white/60">
                    Placeholder: add the video file to VIDEO_SRC in About.tsx.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </section>
  );
}