"use client";

export default function StatsSection() {
  const stats = [
    { value: "5+", label: "Years Experience" },
    { value: "5,000+", label: "Professionals Deployed" },
    { value: "15+", label: "Countries Served" },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-48 h-48 rounded-full bg-white border-2 border-purple-100 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center">
                <div className="text-center p-6">
                  <p className="text-5xl font-bold text-purple-600 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-lg text-gray-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
