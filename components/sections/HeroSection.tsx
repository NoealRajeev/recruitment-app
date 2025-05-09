// components/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative py-16 lg:py-24 min-h-[calc(100vh-80px)] flex items-center"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/hero-bg.png" // Update this path to match your actual image
          alt="Construction workers"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 text-white">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Skilled Workforce,
            <br />
            Seamlessly
            <br />
            Delivered.
          </h1>

          <p className="text-lg md:text-xl mb-8 opacity-90">
            We provide end-to-end manpower solutions for construction and other
            labor-intensive industries.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/submit-requirement">
              <Button className="text-sm font-medium bg-gradient-to-r from-[#6914A8] to-[#290842] hover:from-[#6914A8] hover:to-[#290842] hover:scale-105 transition-all duration-300 px-8 py-3">
                Submit Requirement
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
