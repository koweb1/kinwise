"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { FiArrowUpRight, FiPlay } from "react-icons/fi";
import { CATEGORIES, type Project, type ProjectShape } from "@/lib/projects";
import { useVideoPreview } from "@/hooks/useVideoPreview";

const SHAPES: Record<ProjectShape, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  landscape: "aspect-[4/3]",
  wide: "aspect-video",
};

// Stand-in artwork until the real poster arrives
function PlaceholderArt({ index }: { index: number }) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-[15%] aspect-square w-[70%] rounded-full bg-volt/15 blur-3xl"
        style={{ left: `${10 + ((index * 27) % 50)}%` }}
      />
      <span
        aria-hidden="true"
        className="absolute right-6 top-4 text-[clamp(4rem,9vw,7rem)] font-semibold leading-none text-white/[0.05]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </>
  );
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);

  const category = CATEGORIES.find((item) => item.id === project.category);
  const isVideo = project.media === "video";

  useVideoPreview(cardRef, videoRef, Boolean(project.preview));

  // A "View" bubble follows the cursor (mouse only)
  useEffect(() => {
    const card = cardRef.current;
    const bubble = bubbleRef.current;
    if (!card || !bubble) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (reduce || !finePointer) return;

    gsap.set(bubble, { autoAlpha: 1, xPercent: -50, yPercent: -50, scale: 0 });
    const moveX = gsap.quickTo(bubble, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(bubble, "y", { duration: 0.5, ease: "power3.out" });

    const onEnter = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      gsap.set(bubble, { x: e.clientX - rect.left, y: e.clientY - rect.top });
      gsap.to(bubble, { scale: 1, duration: 0.45, ease: "back.out(2)", overwrite: "auto" });
    };
    const onMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect();
      moveX(e.clientX - rect.left);
      moveY(e.clientY - rect.top);
    };
    const onLeave = () => {
      gsap.to(bubble, { scale: 0, duration: 0.3, ease: "power2.in", overwrite: "auto" });
    };

    card.addEventListener("pointerenter", onEnter);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerleave", onLeave);

    return () => {
      card.removeEventListener("pointerenter", onEnter);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(bubble);
    };
  }, []);

  return (
    <li
      data-flip-id={project.slug}
      data-card
      data-category={project.category}
      className="mb-4 break-inside-avoid opacity-0 sm:mb-6"
    >
      <article
        ref={cardRef}
        className={`group relative isolate overflow-hidden rounded-[1.75rem] bg-graphite has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-volt ${SHAPES[project.shape]}`}
      >
        {/* Media: slow parallax on the outer layer, hover zoom on the inner one */}
        <div data-media className="absolute inset-x-0 -inset-y-[8%]">
          <div className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
            {project.poster ? (
              <Image
                src={project.poster}
                alt=""
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderArt index={index} />
            )}

            {project.preview && (
              <video
                ref={videoRef}
                src={project.preview}
                poster={project.poster}
                muted
                loop
                playsInline
                preload="none"
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover"
              />
            )}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.78),transparent_58%)]"
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 sm:p-5">
          <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-white backdrop-blur-md">
            {category?.label}
          </span>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full border border-white/25 bg-black/30 text-base text-white backdrop-blur-md transition-colors duration-300 group-hover:border-volt group-hover:bg-volt group-hover:text-ink"
          >
            {isVideo ? <FiPlay className="ml-0.5 fill-current" /> : <FiArrowUpRight />}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{project.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-white/70">
            {project.description}
          </p>
        </div>

        {/* The whole card is one link */}
        <Link
          href={`/projects/${project.slug}`}
          aria-label={project.title}
          className="absolute inset-0 z-10 focus-visible:outline-none"
        />

        <span
          ref={bubbleRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute left-0 top-0 z-20 grid size-24 place-items-center rounded-full bg-volt text-sm font-semibold text-ink"
        >
          View
        </span>
      </article>
    </li>
  );
}