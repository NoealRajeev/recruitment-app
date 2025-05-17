import AboutUsSection from "@/components/sections/AboutUsSection";
import ContactSection from "@/components/sections/ContactSection";
import HeroSection from "@/components/sections/HeroSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import WhyUsSection from "@/components/sections/WhyUsSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WhyUsSection />
      <ProcessSection />
      <AboutUsSection />
      <TestimonialsSection />
      <ContactSection />
    </>
  );
}
