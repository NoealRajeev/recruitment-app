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
          <p className="max-w-2xl mx-auto text-[#2C0053] font-light">
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
          <div className="lg:w-1/2 flex flex-col gap-8">
            {/* Main Image with Overlay Text */}
            <div className="relative h-full w-full rounded-2xl">
              <Image
                src="/assets/our-process.png"
                alt="Global recruitment process"
                fill
                className="object-cover"
              />
            </div>

            {/* Stats Section - With reduced gap and dividers */}
            <div className="grid grid-cols-3 text-[#410651]/40 divide-x-2 divide-[#410651]/40 max-w-md mx-auto">
              {/* Workers Stat */}
              <div className="flex flex-col items-center text-center px-16">
                <span className="text-3xl font-bold">5k+</span>
                <p className="mt-1">Workers</p>
              </div>

              {/* Countries Stat */}
              <div className="flex flex-col items-center text-center px-16">
                <span className="text-3xl font-bold">15+</span>
                <p className="mt-1">Countries</p>
              </div>

              {/* Clients Stat */}
              <div className="flex flex-col items-center text-center px-16">
                <span className="text-3xl font-bold">100+</span>
                <p className="mt-1">Clients</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
