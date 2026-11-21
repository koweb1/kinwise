"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";
import Sparkle from "@/components/ui/Sparkle";
import {
  GraphicScene,
  MotionScene,
  VideoScene,
  K_FRACTIONS,
  NIB_REST,
} from "@/components/ui/ServiceScenes";

gsap.registerPlugin(ScrollTrigger);

type AmbientKind = "nib" | "ball" | "playhead";

type Service = {
  id: string;
  number: string;
  title: string;
  description: string;
  ambient: AmbientKind;
  Scene: React.ComponentType<{ className?: string }>;
};

type SceneState = {
  card: HTMLElement;
  kind: AmbientKind;
  intro: gsap.core.Timeline | null;
  ambient: gsap.core.Timeline | null;
};

type SceneApi = {
  play: (index: number) => void;
  pause: (index: number) => void;
  activate: (index: number) => void;
};

const SERVICES: Service[] = [
  {
    id: "graphic-design",
    number: "01",
    title: "Graphic Design",
    description: "Visuals that communicate your brand’s message with clarity and style.",
    ambient: "nib",
    Scene: GraphicScene,
  },
  {
    id: "motion-design",
    number: "02",
    title: "Motion Design",
    description: "Bringing static ideas to life through movement and storytelling.",
    ambient: "ball",
    Scene: MotionScene,
  },
  {
    id: "video-editing",
    number: "03",
    title: "Video Editing",
    description: "Crafting engaging videos that keep people watching.",
    ambient: "playhead",
    Scene: VideoScene,
  },
];

const HEADING = [
  { text: "What" },
  { text: "I" },
  { text: "do.", marker: true },
];

const MARQUEE = [
  { text: "Graphic Design", outline: false },
  { text: "Motion Design", outline: true },
  { text: "Video Editing", outline: false },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt";

// Graphic design: the pen glides to the start, draws the K anchor by anchor,
// the K fills, the selection box appears and the pen rests to the side
function buildPenIntro(card: HTMLElement) {
  const sq = gsap.utils.selector(card);
  const stroke = card.querySelector<SVGPathElement>("[data-k-stroke]");
  const nib = card.querySelector<SVGGElement>("[data-nib]");
  const anchors = sq("[data-anchor]");
  const handles = sq("[data-handle]");
  const tl = gsap.timeline();
  if (!stroke || !nib) return tl;

  const length = stroke.getTotalLength();
  const start = stroke.getPointAtLength(0);
  const draw = { p: 0 };
  const glide = 0.6;
  const duration = 2.4;
  const end = glide + duration;

  tl.set(sq("[data-k-fill]"), { autoAlpha: 0 }, 0)
    .set(stroke, { strokeDashoffset: 1 }, 0)
    .set(sq("[data-select]"), { strokeDashoffset: 1 }, 0)
    .set([...anchors, ...handles], { scale: 0, autoAlpha: 0 }, 0)
    .fromTo(
      sq("[data-swatch]"),
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2)" },
      0
    )
    .fromTo(
      nib,
      { x: NIB_REST.x, y: NIB_REST.y },
      { x: start.x, y: start.y, duration: glide, ease: "power3.inOut" },
      0
    )
    .to(
      draw,
      {
        p: 1,
        duration,
        ease: "none",
        onUpdate: () => {
          const point = stroke.getPointAtLength(draw.p * length);
          gsap.set(stroke, { strokeDashoffset: 1 - draw.p });
          gsap.set(nib, { x: point.x, y: point.y });
        },
      },
      glide
    );

  anchors.forEach((anchor, i) => {
    tl.fromTo(
      anchor,
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.35, ease: "back.out(3)" },
      glide + (K_FRACTIONS[i] ?? 0) * duration
    );
  });

  tl.fromTo(
    sq("[data-k-fill]"),
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: 0.6, ease: "power2.out" },
    end
  )
    .to(
      sq("[data-select]"),
      { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
      end + 0.1
    )
    .to(
      handles,
      { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: "back.out(3)" },
      end + 0.55
    )
    .to(
      nib,
      { x: NIB_REST.x, y: NIB_REST.y, duration: 0.9, ease: "power3.inOut" },
      end + 0.3
    );

  return tl;
}

// Replays the draw-in of a card's scene
function buildIntro(card: HTMLElement, kind: AmbientKind) {
  if (kind === "nib") return buildPenIntro(card);

  const sq = gsap.utils.selector(card);
  return gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .fromTo(
      sq("[data-draw]"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 1.1, stagger: 0.1, ease: "power2.inOut" },
      0
    )
    .fromTo(
      sq("[data-clip]"),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.7, stagger: 0.06, transformOrigin: "0% 50%" },
      0
    )
    .fromTo(
      sq("[data-pop]"),
      { scale: 0, autoAlpha: 0 },
      { scale: 1, autoAlpha: 1, duration: 0.6, stagger: 0.06, ease: "back.out(2)" },
      0.25
    );
}

// The looping motion that runs while a card is active
function buildAmbient(card: HTMLElement, kind: AmbientKind) {
  const sq = gsap.utils.selector(card);
  const tl = gsap.timeline({ paused: true });

  if (kind === "nib") {
    tl.to(
      sq("[data-nib-hover]"),
      { y: -7, x: 3, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 },
      0
    );
  } else if (kind === "ball") {
    tl.fromTo(
      sq("[data-ball]"),
      { x: 0 },
      { x: 390, duration: 1.7, ease: "expo.inOut", yoyo: true, repeat: -1, repeatDelay: 0.35 },
      0
    );
  } else {
    tl.fromTo(
      sq("[data-playhead]"),
      { x: 0 },
      { x: 400, duration: 5.5, ease: "none", repeat: -1, repeatDelay: 0.5 },
      0
    );
  }

  return tl;
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const sceneApi = useRef<SceneApi | null>(null);
  const revealedRef = useRef(false);
  const activeRef = useRef(0);

  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    const mm = gsap.matchMedia();
    let scenes: SceneState[] = [];

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

      // 1. Label, heading, marker and side content
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
            q("[data-intro-fade]"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: d(0.8) },
            "-=0.6"
          );
      }

      // 2. The cards arrive. Desktop: they wipe open one after another.
      //    Mobile and tablet: each slides in from alternating sides (left, right, left).
      const grid = section.querySelector<HTMLElement>("[data-grid]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", section);

      if (grid) {
        if (reduce) {
          gsap.set(cards, { autoAlpha: 1 });
        } else {
          mm.add("(min-width: 1024px)", () => {
            gsap.fromTo(
              cards,
              { clipPath: "inset(100% 0% 0% 0% round 1.75rem)", autoAlpha: 0 },
              {
                clipPath: "inset(0% 0% 0% 0% round 1.75rem)",
                autoAlpha: 1,
                duration: 1.2,
                stagger: 0.14,
                ease: "expo.out",
                clearProps: "clipPath",
                scrollTrigger: { trigger: grid, start: "top 80%" },
              }
            );
          });

          mm.add("(max-width: 1023px)", () => {
            cards.forEach((card, i) => {
              const dir = i % 2 === 0 ? -1 : 1;
              const top = card.querySelector("[data-card-top]");
              const scene = card.querySelector("[data-card-scene]");
              const text = card.querySelector("[data-card-text]");

              const tl = gsap.timeline({
                scrollTrigger: { trigger: card, start: "top 85%" },
              });

              tl.fromTo(
                card,
                {
                  xPercent: dir * 80,
                  rotation: dir * 4,
                  scale: 0.94,
                  autoAlpha: 0,
                  transformOrigin: "50% 100%",
                },
                {
                  xPercent: 0,
                  rotation: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 1.3,
                  ease: "power4.out",
                  clearProps: "transform",
                },
                0
              );

              if (scene) {
                tl.fromTo(
                  scene,
                  { x: -dir * 50 },
                  { x: 0, duration: 1.4, ease: "power4.out" },
                  0.1
                );
              }
              if (top) {
                tl.fromTo(
                  top,
                  { y: -16, autoAlpha: 0 },
                  { y: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
                  0.35
                );
              }
              if (text) {
                tl.fromTo(
                  text,
                  { y: 28, autoAlpha: 0 },
                  { y: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out" },
                  0.55
                );
              }
            });
          });
        }
      }

      // 3. Scene controller: the draw-in replays, then the loop runs
      scenes = cards.map((card) => {
        const kind = (card.dataset.ambient ?? "ball") as AmbientKind;
        return {
          card,
          kind,
          intro: null,
          ambient: reduce ? null : buildAmbient(card, kind),
        };
      });

      const api: SceneApi = {
        play: (i) => {
          const scene = scenes[i];
          if (reduce || !scene) return;

          // A scene that is replaced always finishes first, so none is left half-drawn
          scene.intro?.progress(1).kill();
          const intro = buildIntro(scene.card, scene.kind);
          scene.intro = intro;

          if (scene.kind === "nib") {
            // The pen only hovers once it has finished drawing
            scene.ambient?.pause(0);
            intro.eventCallback("onComplete", () => scene.ambient?.play());
          } else {
            scene.ambient?.play();
          }
        },
        pause: (i) => {
          const scene = scenes[i];
          if (!scene) return;
          scene.intro?.progress(1);
          scene.ambient?.pause();
        },
        activate: (i) => {
          scenes.forEach((_, n) => (n === i ? api.play(n) : api.pause(n)));
        },
      };
      sceneApi.current = api;

      if (grid) {
        ScrollTrigger.create({
          trigger: grid,
          start: "top 75%",
          once: true,
          onEnter: () => {
            revealedRef.current = true;
            if (window.matchMedia("(min-width: 1024px)").matches) {
              api.activate(activeRef.current);
            }
          },
        });
      }

      if (!reduce) {
        // Desktop: whichever card is open plays. Mobile: each card plays in view.
        mm.add("(min-width: 1024px)", () => {
          if (revealedRef.current) api.activate(activeRef.current);
        });

        mm.add("(max-width: 1023px)", () => {
          const triggers = scenes.map((scene, i) =>
            ScrollTrigger.create({
              trigger: scene.card,
              start: "top 65%",
              end: "bottom 25%",
              onEnter: () => api.play(i),
              onEnterBack: () => api.play(i),
              onLeave: () => api.pause(i),
              onLeaveBack: () => api.pause(i),
            })
          );
          return () => triggers.forEach((t) => t.kill());
        });
      }

      // 4. Marquee: loops forever and speeds up while you scroll
      const marquee = section.querySelector<HTMLElement>("[data-marquee]");
      const track = section.querySelector<HTMLElement>("[data-marquee-track]");
      if (marquee) {
        gsap.fromTo(
          marquee,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: d(1),
            ease: "power3.out",
            scrollTrigger: { trigger: marquee, start: "top 92%" },
          }
        );
      }
      if (track && !reduce) {
        const loop = gsap.to(track, { xPercent: -50, duration: 32, ease: "none", repeat: -1 });
        ScrollTrigger.create({
          trigger: track,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 350, 5);
            loop.timeScale(boost);
            gsap.to(loop, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: true });
          },
        });
      }
    }, section);

    return () => {
      mm.revert();
      scenes.forEach((scene) => {
        scene.intro?.kill();
        scene.ambient?.kill();
      });
      sceneApi.current = null;
      revealedRef.current = false;
      ctx.revert();
    };
  }, []);

  // Desktop: replay the scene of the card you open
  useEffect(() => {
    activeRef.current = active;
    if (!revealedRef.current) return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      sceneApi.current?.activate(active);
    }
  }, [active]);

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby="services-heading"
      className="relative overflow-x-clip px-4 pb-24 sm:px-6 sm:pb-32 lg:px-10 lg:pb-40"
    >
      <div className="mx-auto max-w-7xl">
        <div className="relative rounded-[2rem] bg-graphite p-4 sm:rounded-[2.5rem] sm:p-6 sm:pl-12 lg:p-10 lg:pl-16">
          <span
            aria-hidden="true"
            className="absolute left-0 top-10 hidden rotate-180 rounded-l-lg bg-volt px-2 py-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink [writing-mode:vertical-rl] sm:block"
          >
            What I do
          </span>

          {/* Intro */}
          <div
            data-intro
            className="flex flex-col gap-8 pt-2 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <p className="flex items-center gap-3 text-sm text-white/70">
                <span data-dash aria-hidden="true" className="h-[2px] w-5 origin-left bg-volt" />
                <span data-label-text className="opacity-0">
                  Services
                </span>
              </p>

              <h2
                id="services-heading"
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
              className="invisible flex flex-col items-start gap-6 lg:items-end"
            >
              <p className="max-w-xs text-base leading-relaxed text-white/70 lg:text-right">
                Three disciplines, one creative approach.
              </p>
              <Link
                href="/projects"
                className={`group inline-flex items-center gap-3 rounded-full border border-volt/60 py-1.5 pl-6 pr-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-volt hover:text-ink ${FOCUS}`}
              >
                View my work
                <span className="grid size-10 place-items-center rounded-full bg-volt text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-volt">
                  <FiArrowUpRight aria-hidden="true" />
                </span>
              </Link>
            </div>
          </div>

          {/* Cards: stacked on mobile, an expanding row on desktop */}
          <div
            data-grid
            className="mt-10 grid gap-4 sm:mt-12 lg:mt-14 lg:flex lg:h-[36rem] lg:gap-4"
          >
            {SERVICES.map((service, i) => {
              const isActive = active === i;
              return (
                <article
                  key={service.id}
                  data-card
                  data-ambient={service.ambient}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className={`relative isolate flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink p-5 opacity-0 transition-[flex-grow,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-volt sm:min-h-[30rem] sm:p-6 lg:min-h-0 lg:min-w-0 lg:p-7 ${
                    isActive ? "lg:flex-[2.6] lg:border-volt/50" : "lg:flex-1"
                  }`}
                >
                  <div data-card-top className="flex items-start justify-between">
                    <span
                      className={`text-sm font-medium tabular-nums transition-colors duration-500 ${
                        isActive ? "text-white/50 lg:text-volt" : "text-white/50"
                      }`}
                    >
                      {service.number}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`grid size-11 place-items-center rounded-full border border-white/20 text-lg text-white transition-all duration-500 ${
                        isActive ? "lg:rotate-45 lg:border-volt lg:bg-volt lg:text-ink" : ""
                      }`}
                    >
                      <FiArrowUpRight />
                    </span>
                  </div>

                  <div
                    data-card-scene
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 bottom-[38%] top-[13%] flex items-center justify-center lg:transition-transform lg:duration-700 lg:ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isActive ? "lg:scale-100" : "lg:scale-[0.6]"
                    }`}
                  >
                    <service.Scene className="aspect-[3/2] h-full max-w-none shrink-0" />
                  </div>

                  <div data-card-text>
                    <h3 className="text-[1.75rem] font-semibold leading-tight tracking-tight lg:text-[2rem]">
                      <Link
                        href={`/projects?category=${service.id}`}
                        className="after:absolute after:inset-0 focus-visible:outline-none"
                      >
                        {service.title}
                      </Link>
                    </h3>
                    <p
                      className={`mt-3 max-w-sm text-sm leading-relaxed text-white/70 transition-[opacity,transform] duration-500 ${
                        isActive
                          ? "lg:translate-y-0 lg:opacity-100 lg:delay-200"
                          : "lg:translate-y-3 lg:opacity-0"
                      }`}
                    >
                      {service.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div
        data-marquee
        aria-hidden="true"
        className="-mx-4 mt-16 overflow-hidden opacity-0 sm:-mx-6 sm:mt-24 lg:-mx-10"
      >
        <div data-marquee-track className="flex w-max items-center">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {MARQUEE.map((item) => (
                <Fragment key={item.text}>
                  <span
                    className={`px-6 text-[clamp(3rem,10vw,8.5rem)] font-semibold leading-[1.1] tracking-tight sm:px-10 ${
                      item.outline
                        ? "text-transparent [-webkit-text-stroke:2px_rgba(255,255,255,0.85)]"
                        : "text-white"
                    }`}
                  >
                    {item.text}
                  </span>
                  <Sparkle className="size-[clamp(1.5rem,3.5vw,3rem)] shrink-0 text-volt" />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}