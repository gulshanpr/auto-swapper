"use client";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import Hero from "@/components/sections/Hero";
import WhyItMatters from "@/components/sections/WhyItMatters";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <HowItWorks />
      <Features />
      <WhyItMatters />
    </main>
  );
}
