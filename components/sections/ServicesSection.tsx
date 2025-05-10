import { Bolt, Building, LayoutDashboard, Plug, SquarePen } from "lucide-react";

export interface Benefit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  title: string;
  description: string;
}

export const benefits: Benefit[] = [
  {
    icon: Bolt,
    title: "Construction Workers",
    description:
      "Skilled professionals specializing in structural, civil, and finishing tasks. Ideal for residential, commercial, and infrastructure projects.",
  },
  {
    icon: Plug,
    title: "Plumbers & Electricians",
    description:
      "Certified technicians with proven expertise in electrical wiring, installations, and plumbing systems. Ensuring safety and code compliance on every site.",
  },
  {
    icon: LayoutDashboard,
    title: "Masons & Carpenters",
    description:
      "Experienced tradesmen in bricklaying, stonework, wood framing, and interior fit-outs. Precision-crafted to meet your construction standards.",
  },
  {
    icon: Building,
    title: "Facility Maintenance Staff",
    description:
      "Trained personnel for day-to-day building maintenance, including cleaning, minor repairs, and general upkeep. Ensuring smooth facility operations.",
  },
  {
    icon: SquarePen,
    title: "Supervisors & Operators",
    description:
      "Site supervisors and certified machine operators with hands-on industry experience to lead teams and handle heavy-duty equipment safely and efficiently.",
  },
];

function splitTitle(title: string): { floating: string; remaining: string } {
  if (title.includes("&")) {
    const [beforeAmp, ...afterAmp] = title.split("&");
    return {
      floating: [...beforeAmp, "&"].join("").trim(),
      remaining: [...afterAmp].join("").trim(),
    };
  }

  const words = title.split(" ");
  if (words.length >= 3) {
    return {
      floating: words.slice(0, 2).join(" "),
      remaining: words.slice(2).join(" "),
    };
  }

  return {
    floating: words[0],
    remaining: words.slice(1).join(" "),
  };
}

export default function ServicesSection() {
  return (
    <section id="services" className="py-16 lg:py-24 bg-gray-50 text-[#2C0053]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-[#2C0053]">
            Our Workforce Specialties
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-8">
          {benefits.map((benefit, index) => {
            const { floating, remaining } = splitTitle(benefit.title);

            return (
              <div
                key={index}
                className="relative w-full sm:w-[400px] h-[200px] shadow-md transition-all duration-300 hover:-translate-y-1 m-6"
              >
                {/* Floating title part (outside card visually) */}
                <div className="absolute -top-6 left-6 bg-transparent text-[#2C0053] font-bold text-2xl font-poppins z-10">
                  {floating}
                </div>

                {/* Card container with overflow-hidden */}
                <div className="relative flex flex-col h-full rounded-2xl px-6 pb-6 mt-1 bg-gradient-to-br from-white/20 to-[#6914a8]/20 overflow-hidden">
                  {/* Remaining title */}
                  <h3 className="text-2xl font-poppins font-semibold text-[#2C0053]">
                    {remaining}
                  </h3>

                  {/* Description */}
                  <p className="font-normal text-base text-[#2C0053] mt-3 pr-12">
                    {benefit.description}
                  </p>

                  {/* Icon */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#2C0053] text-white rounded-full flex items-center justify-center shadow-lg transform translate-x-2 -translate-y-2 z-10">
                    <benefit.icon size={30} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
