import Hero from "@/components/sections/Hero";

export default function Home() {
  return (
    <>
      <Hero />

      <section
        id="about"
        className="flex min-h-screen items-center justify-center px-6 text-2xl text-white/70"
      >
        About placeholder
      </section>

      <section
        id="services"
        className="flex min-h-screen items-center justify-center px-6 text-2xl text-white/70"
      >
        Services placeholder
      </section>
    </>
  );
}