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
            // Calculate opacity based on position (5 items total)
            const opacityMap = {
              0: "bg-[#2C0053]/20", // First card
              1: "bg-[#2C0053]/35", // Second card
              2: "bg-[#2C0053]/50", // Middle card
              3: "bg-[#2C0053]/35", // Fourth card
              4: "bg-[#2C0053]/20", // Fifth card
            };
            const opacityClass =
              opacityMap[index as keyof typeof opacityMap] || "bg-[#2C0053]/60";

            return (
              <div
                key={index}
                className={`relative flex flex-col w-full sm:w-[400px] h-[250px] ${opacityClass} rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              >
                {/* Icon circle positioned top-right but contained within card */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#2C0053] text-white rounded-full flex items-center justify-center shadow-lg transform translate-x-2 -translate-y-2">
                  <benefit.icon className="text-2xl" />
                </div>

                <h3 className="text-xl font-poppins font-semibold mb-3">
                  {benefit.title}
                </h3>
                <p className="font-normal mt-2 mb-4 max-w-[calc(100%-50px)]">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
