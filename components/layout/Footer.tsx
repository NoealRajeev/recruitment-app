"use client";
import { Facebook, Instagram, Linkedin, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

// Update company links to match your application
const companyLinks = [
  { name: "About Us", path: "/about" },
  { name: "Our Process", path: "/process" },
  { name: "Contact us", path: "/contact" },
  { name: "Testimonials", path: "/testimonials" },
  { name: "Submit Requirement", path: "/submit-requirement" },
];

// Update platform links to match your dashboard sections
const platformLinks = [
  { name: "Requirements", path: "/dashboard/requirements" },
  { name: "Candidates", path: "/dashboard/candidates" },
  { name: "Procedures", path: "/dashboard/procedures" },
  { name: "Reports", path: "/dashboard/reports" },
];

const legalLinks = [
  { name: "Terms of Service", path: "/terms" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Cookie Policy", path: "/cookies" },
];

export default function Footer() {
  const pathname = usePathname();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentYear = new Date().getFullYear();
  const displayYear = currentYear === 2025 ? "2025" : `2025 - ${currentYear}`;

  // Function to handle smooth scrolling with animation
  const handleScroll = (id: string, duration = 1500) => {
    const section = document.getElementById(id);
    if (!section) return;
    const targetPosition = section.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    // Improved Ease-In-Out Function
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      window.scrollTo(0, startPosition + distance * easedProgress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  // Automatically scroll to the correct section on page load if there's a hash
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setTimeout(() => handleScroll(hash, 1200), 600);
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (!isClient || typeof window === "undefined") return;

    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setTimeout(() => handleScroll(hash, 1200), 600);
    }
  }, [pathname, isClient]);

  if (!isClient) return null;

  return (
    <footer className="bg-[#0B0016] text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/Logo-white.png"
                width={200}
                height={32}
                alt="CodeBreak Logo"
                priority
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Skilled Workforce, Seamlessly Delivered.
            </p>
            <p className="text-gray-400/70 mb-6 max-w-md">
              Specializing in end-to-end foreign labor recruitment with a focus
              on transparency and efficiency.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Instagram className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Facebook className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="text-xl" />
              </a>
            </div>
            <div className="mt-4 space-y-1 text-gray-400">
              <p>Email: recruitment@yourcompany.com</p>
              <p>Phone: +1 (234) 567-8900</p>
              <p>Address: Your Company HQ, Dubai, UAE</p>
            </div>
          </div>

          <div className="space-y-4 mr-8">
            <h2 className="text-lg font-semibold">Get Recruitment Updates</h2>
            <form className="flex flex-col space-y-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2 bg-[#1A0A2E] border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <select className="px-4 py-2 bg-[#1A0A2E] border border-gray-700 rounded text-white focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="">I&apos;m interested in...</option>
                <option value="client">Hiring Workers</option>
                <option value="agency">Supplying Workers</option>
                <option value="updates">General Updates</option>
              </select>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          <div className="pl-14">
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="pl-14">
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-2">
              {platformLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {displayYear} Breaktroughf1 LLP. All rights reserved.
          </p>
          <div className="mt-4 flex flex-wrap justify-center space-x-4 text-sm text-gray-500">
            {legalLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
