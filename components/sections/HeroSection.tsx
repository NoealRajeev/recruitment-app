// components/HeroSection.tsx
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";

export default function HeroSection() {
  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative min-h-screen flex items-center py-14 md:py-16 lg:py-24"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/assets/hero-bg.png" // keep your path
          alt="Construction workers"
          fill
          priority
          className="object-cover"
          // Prevent layout shift and load the right size per viewport
          sizes="100vw"
        />
        {/* Subtle overlay for text contrast on busy images (doesn't change your color scheme) */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40" />
      </div>

      {/* Content */}
      <div className="w-full">
        <div
          className="
            container mx-auto
            px-4 sm:px-6 lg:px-8
            text-white
            pt-safe pb-safe
          "
        >
          <div className="max-w-2xl">
            <h1
              className="
                font-bold leading-tight mb-6
                text-3xl sm:text-4xl md:text-5xl lg:text-6xl
              "
            >
              Skilled Workforce,
              <br />
              Seamlessly
              <br />
              Delivered.
            </h1>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/submit-requirement">
                <Button
                  className="
                    text-sm font-medium
                    bg-gradient-to-r from-[#6914A8] to-[#290842]
                    hover:from-[#6914A8] hover:to-[#290842]
                    hover:scale-105 transition-all duration-300
                    px-7 sm:px-8 py-3 w-full sm:w-auto
                  "
                >
                  Submit Requirement
                </Button>
              </Link>
            </div>

            <p
              className="
                opacity-90 mt-5 mb-0
                text-base sm:text-lg md:text-xl
                max-w-prose
              "
            >
              We provide end-to-end manpower solutions for construction and
              other labor-intensive industries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
