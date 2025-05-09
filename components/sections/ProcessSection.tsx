// components/ProcessSection.tsx
import Image from "next/image";
export interface RoadmapStep {
  number: number;
  title: string;
  description: string;
  tags: string[];
}
export const webDevSteps: RoadmapStep[] = [
  {
    number: 1,
    title: "Submit Requirement",
    description: "Share your manpower needs through our quick form",
    tags: ["Manpower Request", "Role Specification", "Talent Needs"],
  },
  {
    number: 2,
    title: "CV Shortlisting",
    description: "We handpick matching candidates manually.",
    tags: ["Candidate Evaluation", "Profile Matching", "Initial Screening"],
  },
  {
    number: 3,
    title: "Approval & Docs",
    description: " You approve; we manage the documentation.",
    tags: [
      "Employer Confirmation",
      "Contract Finalization",
      "Regulatory Compliance",
    ],
  },
  {
    number: 4,
    title: "Medical & Visa",
    description: "We coordinate all health checks and visa processing.",
    tags: ["Health Clearance", "Visa Processing", "Immigration Support"],
  },
  {
    number: 5,
    title: "Deployment",
    description: "Travel booked and workers dispatched on time.",
    tags: ["Travel Coordination", "Onboarding Logistics", "Final Placement"],
  },
];
export default function ProcessSection() {
  return (
    <section id="process" className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-[#2C0053]">
            End-to-End Recruitment Steps
          </h2>
          <p className="max-w-2xl mx-auto text-[#2C0053]font-light">
            From Job Request to Arrival—All in One Flow
          </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-1/2">
            {/* Step-based Timeline */}
            <div className="relative">
              {/* Line */}
              <div className="absolute left-6 top-0 bottom-12 w-0.5 bg-[#4A5565]"></div>

              {/* Steps */}
              {webDevSteps.map((step, index) => {
                const baseOpacity = 0.6 + index * 0.1;
                const clampedOpacity = Math.min(baseOpacity, 1);
                const bgColor = `rgba(44, 0, 83, ${clampedOpacity})`;

                return (
                  <div key={index} className="relative flex items-start mb-8">
                    {/* Line masking block to hide line behind the circle */}
                    {/* Mask to hide line behind the step circle */}
                    <div
                      className="absolute -left-6 -top-2 w-[60] h-[60] rounded-full z-[15]"
                      style={{ backgroundColor: "#FAF9F6" }}
                    />

                    {/* Main step circle */}
                    <div
                      className="flex-shrink-0 w-12 h-12 text-white rounded-full flex items-center justify-center z-20"
                      style={{ backgroundColor: bgColor }}
                    >
                      <span className="font-medium">{step.number}</span>
                    </div>

                    {/* Content */}
                    <div className="ml-6">
                      <h4 className="text-lg font-semibold mb-2 text-[#2C0053]">
                        {step.title}
                      </h4>
                      <p className="text-[#4A5565] mb-3">{step.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {step.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="bg-[#2C0053]/20 text-[#2C0053] text-xs py-1 px-2 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Right Side - New Design */}
          <div className="flex flex-col">
            {/* Image + Rectangle Card */}
            <div className="relative h-[300px] w-full rounded-2xl overflow-hidden shadow-lg mb-12">
              {/* World Map Image (1/3 of card) */}
              <div className="absolute left-0 top-0 bottom-0 w-2/3">
                <Image
                  src="/assets/our-process.png"
                  alt="Global recruitment"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Colored Rectangle (2/3 of card) */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#2C0053]/20 flex flex-col justify-center pl-12 pr-8">
                {/* Logo (replace with your actual logo) */}
                <div className="mb-4">
                  <div className="w-16 h-16 bg-[#2C0053] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    Logo
                  </div>
                </div>
                <p className="text-[#2C0053] font-normal text-3xl">
                  Finds You Well !
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              {/* Workers Stat */}
              <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#2C0053]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#2C0053]">5K+</span>
                </div>
                <p className="text-[#2C0053] font-medium">Workers</p>
              </div>

              {/* Countries Stat */}
              <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#2C0053]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#2C0053]">15+</span>
                </div>
                <p className="text-[#2C0053] font-medium">Countries</p>
              </div>

              {/* Clients Stat */}
              <div className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#2C0053]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-[#2C0053]">
                    100+
                  </span>
                </div>
                <p className="text-[#2C0053] font-medium">Trusted Clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
