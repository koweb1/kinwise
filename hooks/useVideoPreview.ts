import { useEffect } from "react";
import type { RefObject } from "react";

// Only one preview plays at a time, so a phone never decodes several videos at once
let current: HTMLVideoElement | null = null;

const play = (video: HTMLVideoElement) => {
  if (current && current !== video) current.pause();
  current = video;
  const attempt = video.play();
  attempt?.catch(() => {});
};

const stop = (video: HTMLVideoElement) => {
  video.pause();
  if (current === video) current = null;
};

/**
 * Plays a muted preview loop.
 * Mouse: on hover or keyboard focus. Touch: while the card is mostly in view.
 * Skipped for reduced motion and data-saver mode.
 */
export function useVideoPreview(
  containerRef: RefObject<HTMLElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!enabled || !container || !video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (reduce || connection?.saveData) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (finePointer) {
      const start = () => play(video);
      const end = () => stop(video);

      container.addEventListener("pointerenter", start);
      container.addEventListener("pointerleave", end);
      container.addEventListener("focusin", start);
      container.addEventListener("focusout", end);

      return () => {
        container.removeEventListener("pointerenter", start);
        container.removeEventListener("pointerleave", end);
        container.removeEventListener("focusin", start);
        container.removeEventListener("focusout", end);
        stop(video);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play(video);
        else stop(video);
      },
      { threshold: 0.6 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      stop(video);
    };
  }, [containerRef, videoRef, enabled]);
}