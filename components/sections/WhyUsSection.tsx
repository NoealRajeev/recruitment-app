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
    <section id="why us" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-[#2C0053]">
            Why companies trust us ?
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-36">
          {/* Reasons Column */}
          <div className="lg:w-1/2 relative">
            <div className="relative h-full">
              {/* Reasons cards */}
              <div className="space-y-8 pl-12 pr-12">
                {reasons.map((reason, index) => {
                  const opacity = 0.9 - index * 0.1;
                  const bgColor = `rgba(44, 0, 83, ${opacity})`;
                  const isEven = index % 2 === 0;

                  return (
                    <div
                      key={index}
                      className={`relative ${isEven ? "mr-auto" : "ml-auto"}`}
                      style={{
                        width: "calc(100% - 80px)",
                        marginLeft: isEven ? "0" : "240px",
                        marginRight: isEven ? "240px" : "0",
                      }}
                    >
                      <div
                        className="rounded-4xl shadow-xl p-6 my-16 text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        style={{ backgroundColor: bgColor }}
                      >
                        <div className="flex items-center gap-4">
                          <CircleCheckBig
                            className="flex-shrink-0 text-white"
                            size={24}
                          />
                          <p className="text-lg font-medium">{reason}</p>
                        </div>
                      </div>
                      {index < reasons.length - 1 && (
                        <div
                          className="absolute top-full mt-6 flex items-center"
                          style={{
                            left: isEven ? "calc(100% - 40px)" : undefined,
                            right: !isEven ? "calc(100% - 40px)" : undefined,
                          }}
                        >
                          {isEven ? (
                            <>
                              <div className="h-[3px] w-40 bg-black" />
                              <div className="w-3 h-3 rounded-full bg-black" />
                            </>
                          ) : (
                            <>
                              <div className="w-3 h-3 rounded-full bg-black" />
                              <div className="h-[3px] w-40 bg-black" />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Image Column */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] lg:w-[600px] lg:h-[600px]">
              <div className="absolute inset-0 rounded-full border-4 border-white shadow-xl overflow-hidden">
                <Image
                  src="/assets/process.png"
                  alt="Our process"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
