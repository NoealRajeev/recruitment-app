"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/Button";

const navItems = [
  "Home",
  "Services",
  "Why Us",
  "Process",
  "About Us",
  "Contact",
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState("home");

  // Smooth Scroll Function
  const handleScroll = useCallback((id: string, duration = 1500) => {
    const section = document.getElementById(id.toLowerCase());
    if (!section) return;

    const targetPosition = section.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

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
  }, []);

  // Handle Navigation Click
  const handleNavClick = (id: string) => {
    if (pathname === "/") {
      handleScroll(id);
    } else {
      router.push("/");
      setTimeout(() => {
        handleScroll(id);
      }, 600);
    }
  };

  // Detect Active Section on Scroll
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const footer = document.querySelector("footer");

    const detectActiveSection = () => {
      if (pathname !== "/") {
        setActive("");
        return;
      }

      let currentSection = "home";
      sections.forEach((section) => {
        if (!section.id) return;
        const rect = section.getBoundingClientRect();
        if (
          rect.top <= window.innerHeight / 2 &&
          rect.bottom >= window.innerHeight / 2
        ) {
          currentSection = section.id;
        }
      });

      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top <= window.innerHeight) {
          currentSection = sections[sections.length - 1].id;
        }
      }

      setActive(currentSection);
    };

    setTimeout(detectActiveSection, 300);
    window.addEventListener("scroll", detectActiveSection);
    return () => window.removeEventListener("scroll", detectActiveSection);
  }, [pathname]);

  return (
    <header className="text-black sticky top-0 z-50 bg-white/90">
      <div
        className="absolute inset-0 -z-10 backdrop-blur-sm"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0, 0, 0, 0) 0%, black 100%)",
          maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 0%, black 100%)",
        }}
      ></div>
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
        >
          <Image
            src="/assets/Logo-black.png"
            width={200}
            height={32}
            alt="CodeBreak Logo"
            priority
          />
        </Link>

        {/* Desktop Navigation - Fixed Layout Issue */}
        <nav className="hidden md:flex space-x-8">
          <ul className="flex space-x-6">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`py-2 border-b-2 ${
                    active === item.toLowerCase()
                      ? "border-[#2C0053]"
                      : "border-transparent hover:border-[#2C0053]"
                  } transition-all duration-200 font-medium`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Link href="/auth/login">
            <div className="hidden sm:block text-sm font-medium py-2 px-3 rounded hover:bg-gradient-to-r hover:from-[#6914A8] hover:to-[#290842] hover:text-white">
              Log In
            </div>
          </Link>
          <Link href="/auth/register">
            <Button className="text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-[#6914A8] to-[#290842] hover:from-[#6914A8] hover:to-[#290842] hover:scale-105 hover:shadow-lg hover:shadow-[#6914A8]/30">
              Sign Up
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <i className="fas fa-bars text-xl"></i>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-[#000a26] text-white border-[#101d3d] p-0"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-[#101d3d]">
                  <Image
                    src="/assets/Logo-text-plain.png"
                    width={200}
                    height={32}
                    alt="CodeBreak Logo"
                    priority
                  />
                </div>
                <nav className="flex flex-col p-4">
                  <ul>
                    {navItems.map((item) => (
                      <li key={item}>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleNavClick(item);
                          }}
                          className={`py-3 px-4 ${
                            active === item.toLowerCase()
                              ? "bg-[#101d3d] text-white"
                              : "text-gray-300 hover:bg-[#101d3d] hover:text-white"
                          } rounded-md transition-all duration-200 font-medium`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="mt-auto p-4 border-t border-[#101d3d]">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      className="w-full text-white border-white hover:bg-[#101d3d]"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="w-full bg-[#ED1C24] hover:bg-[#d4171e]">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
