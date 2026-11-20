import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <Hero />
      <About />

      <section
        id="services"
        className="flex min-h-screen items-center justify-center px-6 text-2xl text-white/70"
      >
        Services placeholder
      </section>
    </>
  );
}