// app/(public)/about/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { Linkedin, Mail, Twitter } from "lucide-react";

export default function AboutPage() {
  const stats = [
    { value: "10+", label: "Years Experience" },
    { value: "5,000+", label: "Professionals Deployed" },
    { value: "15+", label: "Countries Served" },
  ];

  const founders = [
    {
      name: "Noeal Rajeev",
      role: "Co-Founder and CTO at Breakthroughf1 LLP",
      description:
        "Excels in developing innovative hardware and software solutions. With expertise in IoT, embedded systems, and data analytics, committed to tackling real-world challenges through advanced technology.",
      image: "/assets/noeal-rajeev.jpg",
      linkedin: "https://www.linkedin.com/in/noealrajeevthaleeparambil/",
      email: "cto@breakthroughf1.com",
      twitter: "#",
    },
    {
      name: "Alfred Shaju",
      role: "Co-Founder and CEO of Breakthroughf1 LLP",
      description:
        "Drives innovation by merging business strategy with technical expertise. With a strong foundation in both areas, leads the company toward sustainable growth and industry leadership.",
      image: "/assets/alfred-shaju.jpg",
      linkedin: "https://www.linkedin.com/in/alfredshaju/",
      email: "ceo@breakthroughf1.com",
      twitter: "#",
    },
  ];

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

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-48 h-48 rounded-full bg-white border-2 border-purple-100 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center">
                  <div className="text-center p-6">
                    <p className="text-5xl font-bold text-purple-600 mb-2">
                      {stat.value}
                    </p>
                    <p className="text-lg text-gray-600 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      {/* Founders */}
      <section className="relative w-full min-h-screen flex md:flex-row flex-col items-center justify-center text-center px-6 py-16 pt-36 sm:pt-10">
        <div className="flex flex-col md:items-start items-center space-y-4 mx-auto my-auto">
          <h2 className="text-5xl md:text-7xl font-bold text-[#290842] tracking-wide">
            Meet The
          </h2>
          <h2 className="text-5xl md:text-7xl font-bold text-[#290842] tracking-wide">
            Founders.
          </h2>
        </div>
        <div className="grid md:grid-rows-2 grid-cols-1 gap-12 max-w-6xl mx-auto pt-20 md:pt-12">
          {founders.map((f, i) => (
            <React.Fragment key={i}>
              <div className="flex md:flex-row flex-col items-center md:items-start md:text-start space-y-2 md:space-x-20">
                <div className="flex flex-col items-center text-center space-y-4 pb-6">
                  <img
                    src={f.image}
                    alt={f.name}
                    className="w-40 h-40 rounded-full object-cover shadow-lg"
                  />
                  <div className="flex justify-center space-x-5 mt-4">
                    <a href={f.twitter} aria-label="Twitter">
                      <Twitter className="w-6 h-6" />
                    </a>
                    <a href={`mailto:${f.email}`} aria-label="Email">
                      <Mail className="w-6 h-6" />
                    </a>
                    <a href={f.linkedin} aria-label="LinkedIn">
                      <Linkedin className="w-6 h-6" />
                    </a>
                  </div>
                </div>
                <div className="flex flex-col max-w-lg space-y-5">
                  <h3 className="text-2xl sm:text-3xl font-semibold text-[#656565]">
                    {f.name}
                  </h3>
                  <p className="text-base sm:text-lg font-medium text-gray_">
                    {f.role}
                  </p>
                  <p className="mt-2 text-base sm:text-lg text-black leading-relaxed pb-8">
                    {f.description}
                  </p>
                  {i < founders.length - 1 && (
                    <div className="h-2 w-32 bg-[#A6A6A6] mx-10 rounded mt-20" />
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>
    </>
  );
}
