"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import components that might use browser APIs
const StatsSection = dynamic(() => import("@/components/about/StatsSection"), {
  ssr: false,
});
const FoundersSection = dynamic(
  () => import("@/components/about/FoundersSection"),
  { ssr: false }
);

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 min-h-screen flex items-center">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/assets/About-Bg.png"
            alt="Construction workers"
            fill
            className="object-cover"
            priority
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(11,11,11,1), rgba(113,113,113,0))",
            }}
          />
        </div>
        <div className="container mx-auto px-4 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Connecting Global Talent
              <br />
              with Opportunity Since
              <br />
              2025.
            </h1>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl md:text-3xl text-[#1E0034] mb-12">
              <span className="text-[#2C0053]/65 text-7xl font-monkeyland mr-2.5">
                “
              </span>
              [Company Name] is a leading foreign labor recruitment specialist
              with [X] years of experience in bridging skilled workforce gaps
              across industries. Licensed by [Government Body], we&apos;ve
              successfully deployed over [X,XXX] professionals to projects in
              [Key Countries].
            </p>
          </div>
        </div>
      </section>

      {/* Stats - Loaded client-side only */}
      <StatsSection />

      {/* Promise Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="relative w-[600px] h-[863px] overflow-visible z-10 mr-32">
              <Image
                src="/assets/about-element.png"
                alt="Mission Illustration"
                width={600}
                height={863}
                className="object-contain"
                priority
              />
            </div>
            <div className="lg:w-1/2 lg:pl-28 mb-12 lg:mb-0">
              <h2 className="text-4xl md:text-5xl font-bold text-[#290842] mb-8">
                Promise
              </h2>
              <div className="space-y-12">
                <div>
                  <h3 className="text-3xl font-bold text-[#6914A8] mb-4">
                    Our Mission
                  </h3>
                  <p className="text-xl text-[#3E1F55]">
                    To deliver ethical, efficient workforce solutions that power
                    global industries.
                  </p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#6914A8] mb-4">
                    Our Values
                  </h3>
                  <p className="text-xl text-[#3E1F55]">
                    A world where talent meets opportunity without borders.
                  </p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#6914A8] mb-4">
                    Our Promise
                  </h3>
                  <p className="text-xl text-[#3E1F55]">
                    Transparent processes from recruitment to deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founders - Loaded client-side only */}
      <FoundersSection />
    </>
  );
}
