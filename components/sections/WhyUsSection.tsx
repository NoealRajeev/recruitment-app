import { CircleCheckBig } from "lucide-react";
import Image from "next/image";

export default function WhyUsSection() {
  const reasons = [
    "Verified and skilled workers",
    "On-time project delivery guarantee",
    "Competitive pricing with no hidden costs",
    "24/7 support and emergency response",
    "Compliance with all safety regulations",
  ];

  return (
    <section id="why us" className="py-20 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center my-24">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2C0053]">
            Why companies trust us <span className="text-5xl">?</span>
          </h2>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20">
          {/* Left: Reasons List */}
          <div className="flex flex-col items-start gap-6 lg:w-1/2">
            {reasons.map((reason, index) => (
              <div key={index} className="flex items-center gap-4 text-left">
                <CircleCheckBig className="text-[#2C0053]" size={45} />
                <p className="text-2xl text-[#2C0053] font-medium">{reason}</p>
              </div>
            ))}
          </div>

          {/* Right: Illustration */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] relative">
              <Image
                src="/assets/why-choose-us-illustration.svg"
                alt="Why companies trust us"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
