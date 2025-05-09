import { FaStar } from "react-icons/fa";

const testimonials = [
  {
    name: "Kyle Roberts DVM",
    title: "Customer Web Consultant",
    text: "Findly helped us hire 150+ workers across 3 countries in just 30 days. Seamless and efficient!",
    image: "/images/kyle.jpg",
  },
  {
    name: "Sophia Anderson",
    title: "Internal Implementation Officer",
    text: "We’ve worked with multiple agencies, but Findly stands out. Fast communication and quality.",
    image: "/images/sophia.jpg",
  },
  {
    name: "Stephen Brekke",
    title: "Legacy Integration Producer",
    text: "From CV shortlisting to deployment, Findly owns the process. We just say yes!",
    image: "/images/stephen.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#2C0053] text-[#BFB2CB] py-3 px-6 text-left">
      {/* Header */}
      <h2 className="text-[50] sm:text-3xl font-bold">Hear from our</h2>
      <h1 className="text-7xl sm:text-5xl font-bold mb-12 mr-13.5">Users,</h1>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto items-start">
        {testimonials.map((t, index) => (
          <div key={index} className="flex flex-col items-center text-left space-y-4 relative px-4">
            <img
              src={t.image}
              alt={t.name}
              className="w-16 h-16 rounded-full object-cover"
            />

            {/* Stars */}
            <div className="flex space-x-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} />
              ))}
          </div>
            <div className="text-left max-w-xs">
            {/* Testimonial Text */}
            <p className="text-sm sm:text-base font-light text-left mb-4">“{t.text}”</p>

            {/* Name & Title */}
            <div className="text-[20] ">
              <p className="font-regular text-white">{t.name}</p>
              <p className="text-sm text-[#B6A7C7]">{t.title}</p>
            </div>
          </div>

            {/* Divider */}
            {index < testimonials.length - 1 && (
              <div className="hidden md:block absolute right-[-1.5rem] top-1/2 transform -translate-y-1/2 h-24 w-[1px] bg-[#70528A]" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
