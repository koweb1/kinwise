"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";

gsap.registerPlugin(ScrollToPlugin);

type NavLink = { id: string; label: string; href: string };

const AVATAR_SRC = "/avatar.png";
const SCROLL_OFFSET = 96;

// In page order. "process" has no link of its own, but it is listed so that
// Services does not stay lit while you are reading the Process section.
const SECTION_IDS = ["about", "services", "process", "works", "contact"];

const LEFT_LINKS: NavLink[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "about", label: "About", href: "/#about" },
  { id: "services", label: "Services", href: "/#services" },
];

const RIGHT_LINKS: NavLink[] = [{ id: "works", label: "Projects", href: "/#works" }];

const MOBILE_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt";

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTl = useRef<gsap.core.Timeline | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Entrance animation and mobile menu timeline
  useEffect(() => {
    const nav = navRef.current;
    const menu = menuRef.current;
    if (!nav || !menu) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = (seconds: number) => (reduce ? 0 : seconds);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        nav,
        { y: -60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: d(1), delay: d(0.2), ease: "power3.out" }
      );

      const items = menu.querySelectorAll("[data-menu-item]");
      gsap.set(menu, { autoAlpha: 0 });

      menuTl.current = gsap
        .timeline({
          paused: true,
          onReverseComplete: () => {
            gsap.set(menu, { autoAlpha: 0 });
          },
        })
        .set(menu, { autoAlpha: 1 })
        .fromTo(
          menu,
          { clipPath: "circle(0% at 88% 4%)" },
          { clipPath: "circle(150% at 88% 4%)", duration: d(0.7), ease: "power3.inOut" }
        )
        .fromTo(
          items,
          { y: 40, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: d(0.5),
            stagger: reduce ? 0 : 0.07,
            ease: "power3.out",
          },
          "-=0.35"
        );
    });

    return () => {
      ctx.revert();
      menuTl.current = null;
    };
  }, []);

  // Play or reverse the mobile menu
  useEffect(() => {
    const tl = menuTl.current;
    if (!tl) return;

    if (menuOpen) {
      tl.play();
    } else if (tl.progress() > 0) {
      tl.reverse();
    }

    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Close the menu on Escape or when the screen grows to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    mq.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Slightly translucent pill once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy for the home page sections
  useEffect(() => {
    if (pathname !== "/") return;

    const onScroll = () => {
      let current = "home";
      for (const id of SECTION_IDS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const isActive = (link: NavLink) => {
    // On the standalone Projects page, the Projects link is the lit one
    if (pathname.startsWith("/projects")) return link.id === "works";
    if (pathname === "/") return activeSection === link.id;
    return false;
  };

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: NavLink
  ) => {
    setMenuOpen(false);
    if (pathname !== "/") return;

    if (link.id === "home") {
      e.preventDefault();
      gsap.to(window, { scrollTo: 0, duration: 1, ease: "power3.inOut" });
      return;
    }

    if (link.href.startsWith("/#")) {
      const target = document.querySelector(link.href.slice(1));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: target, offsetY: SCROLL_OFFSET },
        duration: 1,
        ease: "power3.inOut",
      });
    }
  };

  const renderLink = (link: NavLink) => {
    const active = isActive(link);
    return (
      <Link
        key={link.id}
        href={link.href}
        onClick={(e) => handleLinkClick(e, link)}
        aria-current={active ? "true" : undefined}
        className={`relative whitespace-nowrap pb-0.5 text-[13px] transition-colors duration-300 ${FOCUS} ${
          active ? "text-volt" : "text-white/80 hover:text-volt"
        }`}
      >
        {link.label}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-left bg-volt transition-transform duration-300 ${
            active ? "scale-x-100" : "scale-x-0"
          }`}
        />
      </Link>
    );
  };

  const logo = (
    <Link
      href="/"
      aria-label="Kinwise, home"
      onClick={(e) => handleLinkClick(e, LEFT_LINKS[0])}
      className={`group flex items-center gap-2.5 ${FOCUS}`}
    >
      <span className="relative block size-9 overflow-hidden rounded-full border-2 border-volt bg-graphite transition-transform duration-300 group-hover:scale-105">
        <Image src={AVATAR_SRC} alt="" fill sizes="40px" className="object-cover" />
      </span>
      <span className="text-[17px] font-medium text-white">Kinwise</span>
    </Link>
  );

  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50 px-4 sm:px-6 lg:top-6">
        <nav
          ref={navRef}
          aria-label="Main"
          className={`invisible mx-auto max-w-6xl rounded-full border border-white/10 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.45)] transition-[background-color,backdrop-filter] duration-300 ${
            scrolled ? "bg-ink/85 backdrop-blur-md" : "bg-ink"
          }`}
        >
          {/* Desktop */}
          <div className="hidden grid-cols-[1fr_auto_1fr] items-center py-2 pl-8 pr-2.5 lg:grid">
            <div className="flex items-center gap-8">
              {LEFT_LINKS.map(renderLink)}
            </div>
            <div className="px-6">{logo}</div>
            <div className="flex items-center justify-end gap-8">
              {RIGHT_LINKS.map(renderLink)}
              <Link
                href="/#contact"
                className={`rounded-full bg-volt px-[18px] py-2.5 text-[13px] font-medium text-ink transition-transform duration-300 hover:scale-[1.04] ${FOCUS}`}
              >
                Contact me
              </Link>
            </div>
          </div>

          {/* Mobile and tablet */}
          <div className="flex items-center justify-between py-2 pl-3 pr-2 lg:hidden">
            {logo}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((open) => !open)}
              className={`grid size-10 place-items-center rounded-full bg-volt text-xl text-ink transition-transform duration-200 active:scale-95 ${FOCUS}`}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile and tablet menu */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className="invisible fixed inset-0 z-40 flex flex-col justify-between bg-ink bg-[radial-gradient(circle_at_85%_105%,rgba(217,254,27,0.16),transparent_55%)] px-6 pb-10 pt-28 lg:hidden"
      >
        <ul className="flex flex-col gap-1">
          {MOBILE_LINKS.map((link) => (
            <li key={link.id} data-menu-item>
              <Link
                href={link.href}
                onClick={(e) => handleLinkClick(e, link)}
                className={`block text-[clamp(2.5rem,12vw,4rem)] font-medium leading-tight tracking-tight transition-colors duration-300 ${FOCUS} ${
                  isActive(link) ? "text-volt" : "text-white hover:text-volt"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div data-menu-item>
          <Link
            href="/#contact"
            onClick={() => setMenuOpen(false)}
            className={`inline-flex items-center gap-2 rounded-full bg-volt px-7 py-4 text-base font-medium text-ink ${FOCUS}`}
          >
            Contact me
            <FiArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </>
  );
}