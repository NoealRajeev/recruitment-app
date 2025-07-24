"use client";

import Image from "next/image";
import { Linkedin, Mail, Twitter } from "lucide-react";

export default function FoundersSection() {
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
          <div
            key={i}
            className="flex md:flex-row flex-col items-center md:items-start md:text-start space-y-2 md:space-x-20"
          >
            <div className="flex flex-col items-center text-center space-y-4 pb-6">
              <div className="w-40 h-40 relative">
                <Image
                  src={f.image}
                  alt={f.name}
                  fill
                  className="rounded-full object-cover shadow-lg"
                />
              </div>
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
        ))}
      </div>
    </section>
  );
}
