"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";
import ProjectCard from "@/components/ui/ProjectCard";
import { CATEGORIES, getFeaturedProjects, type CategoryId } from "@/lib/projects";

gsap.registerPlugin(ScrollTrigger, Flip);

type Filter = "all" | CategoryId;

const FEATURED = getFeaturedProjects();

const CHIPS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  ...CATEGORIES.map((category) => ({ id: category.id as Filter, label: category.short })),
];

const HEADING = [
  { text: "A" },
  { text: "few" },
  { text: "things" },
  { text: "I’ve" },
  { text: "brought" },
  { text: "to" },
  { text: "life.", marker: true },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt";

export default function Works() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const filterRef = useRef<Filter>("all");
  const mountedRef = useRef(false);
  const busyRef = useRef(false);
  const flipRef = useRef<{ state: ReturnType<typeof Flip.getState>; hasStaying: boolean } | null>(
    null
  );

  const [filter, setFilter] = useState<Filter>("all");

  const visible = FEATURED.filter((project) => filter === "all" || project.category === filter);
  const activeLabel = CHIPS.find((chip) => chip.id === filter)?.label ?? "";
  const status =
    filter === "all"
      ? `Showing all ${visible.length} featured projects`
      : `Showing ${visible.length} ${activeLabel} ${visible.length === 1 ? "project" : "projects"}`;

  // Intro and first scroll reveals
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(section);

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
            q("[data-intro-fade]"),
            { y: 24, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: d(0.8) },
            "-=0.6"
          )
          .fromTo(
            q("[data-chips]"),
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: d(0.7) },
            "-=0.5"
          );
      }

      gsap.utils.toArray<HTMLElement>("[data-card]", section).forEach((card) => {
        gsap.fromTo(
          card,
          { y: 70, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: d(1.1),
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: card, start: "top 90%" },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Slow parallax inside the cards (rebuilt whenever the visible set changes)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-media]", section).forEach((media) => {
        gsap.fromTo(
          media,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: "none",
            scrollTrigger: {
              trigger: media.parentElement ?? media,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      });
    }, section);

    return () => ctx.revert();
  }, [filter]);

  // The lime pill glides to the active chip
  useLayoutEffect(() => {
    const button = btnRefs.current[filter];
    const indicator = indicatorRef.current;
    const scroller = scrollRef.current;
    if (!button || !indicator) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animate = mountedRef.current && !reduce;

    filterRef.current = filter;
    gsap.to(indicator, {
      x: button.offsetLeft,
      width: button.offsetWidth,
      duration: animate ? 0.6 : 0,
      ease: "power3.out",
      overwrite: true,
    });

    if (scroller && mountedRef.current) {
      scroller.scrollTo({
        left: button.offsetLeft - (scroller.clientWidth - button.offsetWidth) / 2,
        behavior: reduce ? "auto" : "smooth",
      });
    }
    mountedRef.current = true;
  }, [filter]);

  // Keep the pill aligned when the chips change size (fonts loading, resize)
  useEffect(() => {
    const chips = chipsRef.current;
    if (!chips || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      const button = btnRefs.current[filterRef.current];
      const indicator = indicatorRef.current;
      if (!button || !indicator) return;
      gsap.set(indicator, { x: button.offsetLeft, width: button.offsetWidth });
    });
    observer.observe(chips);

    return () => observer.disconnect();
  }, []);

  // After React shows the new set, the cards that stay glide to their new places
  // and the new ones rise in
  useLayoutEffect(() => {
    const pending = flipRef.current;
    const grid = gridRef.current;
    if (!pending || !grid) return;
    flipRef.current = null;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = gsap.utils.toArray<HTMLElement>("[data-flip-id]", grid);

    const finish = () => {
      grid.style.minHeight = "";
      busyRef.current = false;
      ScrollTrigger.refresh();
    };

    const rise = (elements: Element[]) =>
      gsap.fromTo(
        elements,
        { autoAlpha: 0, y: 40, scale: 0.94 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          delay: pending.hasStaying ? 0.3 : 0,
          ease: "power3.out",
          stagger: 0.06,
          clearProps: "transform",
          onComplete: pending.hasStaying ? undefined : finish,
        }
      );

    if (reduce) {
      gsap.set(targets, { autoAlpha: 1 });
      finish();
      return;
    }

    if (!pending.hasStaying) {
      rise(targets);
      return;
    }

    Flip.from(pending.state, {
      targets,
      duration: 0.9,
      ease: "power3.inOut",
      stagger: 0.05,
      onEnter: rise,
      onComplete: finish,
    });
  }, [filter]);

  const changeFilter = (next: Filter) => {
    if (next === filter || busyRef.current) return;

    const grid = gridRef.current;
    if (!grid) {
      setFilter(next);
      return;
    }

    busyRef.current = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cards = gsap.utils.toArray<HTMLElement>("[data-flip-id]", grid);
    const staying = cards.filter((card) => next === "all" || card.dataset.category === next);
    const leaving = cards.filter((card) => !staying.includes(card));

    // Hold the height so the page below does not jump while the cards move
    grid.style.minHeight = `${grid.offsetHeight}px`;

    const commit = () => {
      flipRef.current = { state: Flip.getState(staying), hasStaying: staying.length > 0 };
      setFilter(next);
    };

    if (reduce || leaving.length === 0) {
      commit();
      return;
    }

    gsap.to(leaving, {
      autoAlpha: 0,
      scale: 0.92,
      duration: 0.35,
      ease: "power2.in",
      stagger: 0.03,
      onComplete: commit,
    });
  };

  return (
    <section
      ref={sectionRef}
      id="works"
      aria-labelledby="works-heading"
      className="relative overflow-x-clip px-4 pb-24 pt-8 sm:px-6 sm:pb-32 lg:px-10 lg:pb-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* Intro */}
        <div data-intro className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-3 text-sm text-white/70">
              <span data-dash aria-hidden="true" className="h-[2px] w-5 origin-left bg-volt" />
              <span data-label-text className="opacity-0">
                Selected works
              </span>
            </p>

            <h2
              id="works-heading"
              className="mt-5 max-w-3xl text-[clamp(2.25rem,5.6vw,4.25rem)] font-semibold leading-[1.04] tracking-tight [word-spacing:0.08em]"
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

          <div data-intro-fade className="invisible flex flex-col items-start gap-6 lg:items-end">
            <p className="max-w-xs text-base leading-relaxed text-white/70 lg:text-right">
              Different ideas. Different challenges. One creative approach.
            </p>
            <Link
              href="/projects"
              className={`group inline-flex items-center gap-3 rounded-full border border-volt/60 py-1.5 pl-6 pr-1.5 text-sm font-medium text-white transition-colors duration-300 hover:bg-volt hover:text-ink ${FOCUS}`}
            >
              View all projects
              <span className="grid size-10 place-items-center rounded-full bg-volt text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-volt">
                <FiArrowUpRight aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div
          ref={scrollRef}
          data-chips
          className="-mx-4 mt-10 overflow-x-auto px-4 pb-2 opacity-0 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <div
            ref={chipsRef}
            role="group"
            aria-label="Filter projects by category"
            className="relative flex w-max gap-2"
          >
            <span
              ref={indicatorRef}
              aria-hidden="true"
              className="absolute left-0 top-0 h-full w-0 rounded-full bg-volt"
            />
            {CHIPS.map((chip) => (
              <button
                key={chip.id}
                ref={(element) => {
                  btnRefs.current[chip.id] = element;
                }}
                type="button"
                aria-pressed={filter === chip.id}
                onClick={() => changeFilter(chip.id)}
                className={`relative z-10 whitespace-nowrap rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors duration-300 hover:text-white aria-pressed:border-transparent aria-pressed:text-ink aria-pressed:hover:text-ink ${FOCUS}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {status}
        </p>

        {/* Gallery: columns keep it tidy whatever the mix of shapes and whichever filter is on */}
        <ul
          ref={gridRef}
          className="mt-8 columns-1 gap-4 sm:columns-2 sm:gap-6 lg:columns-3"
        >
          {visible.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={FEATURED.findIndex((item) => item.slug === project.slug)}
            />
          ))}
        </ul>

        {visible.length === 0 && (
          <p className="mt-8 text-white/60">No featured projects in this category yet.</p>
        )}
      </div>
    </section>
  );
}