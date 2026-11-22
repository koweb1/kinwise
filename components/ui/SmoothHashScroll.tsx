"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const OFFSET = 96;

// Any link to a section of the home page (like "/#contact") glides there smoothly
// while you are on the home page. From other pages, the link works as a normal link.
export default function SmoothHashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      const match = href?.match(/^\/?#([\w-]+)$/);
      if (!match) return;

      const id = match[1];
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let destination = 0;
      if (id !== "home") {
        const target = document.getElementById(id);
        if (!target) return;
        destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - OFFSET);
      }

      // Runs before Next.js sees the click, so it does not jump to the section first
      event.preventDefault();

      const distance = Math.abs(destination - window.scrollY);
      gsap.to(window, {
        scrollTo: destination,
        duration: reduce ? 0 : gsap.utils.clamp(0.9, 2.2, distance / 2500),
        ease: "power3.inOut",
        overwrite: true,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  return null;
}