"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/Button";
import { Menu } from "lucide-react";

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleScroll = useCallback((id: string, duration = 1500) => {
    if (typeof window === "undefined") return;

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

  if (!isClient) return null;

  return (
    <header className="text-black sticky top-0 z-50 bg-white/90">
      <div
        className="absolute inset-0 -z-10 backdrop-blur-sm"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, rgba(0, 0, 0, 0) 0%, black 100%)",
          maskImage: "linear-gradient(to top, rgba(0, 0, 0, 0) 0%, black 100%)",
        }}
      />
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => isMobileMenuOpen && setIsMobileMenuOpen(false)}
        >
          <Image
            src="/assets/Logo-black.png"
            width={220}
            height={32}
            alt="Findly Logo"
            priority
            className="w-auto h-8 sm:h-10"
          />
        </Link>

        {/* Desktop Navigation */}
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

        {/* Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Desktop buttons */}
          <Link href="/auth/login">
            <div className="hidden sm:block text-sm font-medium py-2 px-3 rounded hover:bg-gradient-to-r hover:from-[#6914A8] hover:to-[#290842] hover:text-white transition">
              Log In
            </div>
          </Link>
          <Link href="/auth/register">
            <Button className="hidden sm:inline-block text-sm font-medium text-white transition-all duration-200 bg-gradient-to-r from-[#6914A8] to-[#290842] hover:scale-105 hover:shadow-lg hover:shadow-[#6914A8]/30">
              Sign Up
            </Button>
          </Link>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              {/* Icon-only button: transparent bg, brand-colored icon */}
              <button
                aria-label="Open menu"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-black/5 active:bg-black/10 transition"
              >
                <Menu className="h-6 w-6 text-[#2C0053]" />
              </button>
            </SheetTrigger>

            {/* Theming the panel to app colors */}
            <SheetContent
              side="right"
              className="bg-white text-[#2C0053] border-l border-[#E6D9F0] p-0"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="p-4 border-b border-[#E6D9F0]">
                  <Image
                    src="/assets/Logo-black.png"
                    width={180}
                    height={28}
                    alt="Findly Logo"
                    priority
                  />
                </div>

                {/* Mobile Nav */}
                <nav className="flex flex-col p-4 space-y-1">
                  <ul>
                    {navItems.map((item) => (
                      <li key={item}>
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleNavClick(item);
                          }}
                          className={`w-full text-left py-3 px-4 rounded-md transition-all duration-200 font-medium ${
                            active === item.toLowerCase()
                              ? "bg-[#F3ECF7] text-[#2C0053]"
                              : "hover:bg-[#F7F1FA] text-[#2C0053]/80"
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile Auth buttons — themed */}
                <div className="mt-auto p-4 border-t border-[#E6D9F0] space-y-3">
                  <Link href="/auth/login" className="block">
                    <Button
                      variant="outline"
                      className="w-full border-[#2C0053] text-[#2C0053] hover:bg-[#F3ECF7]"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="block">
                    <Button className="w-full bg-gradient-to-r from-[#6914A8] to-[#290842] text-white hover:opacity-95">
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
