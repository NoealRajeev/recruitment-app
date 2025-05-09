import { Star, StarHalf } from "lucide-react";
export interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  content: string;
  rating: number;
}
export const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Emily Rodriguez",
    role: "Front-end Developer",
    avatar: "https://randomuser.me/api/portraits/women/42.jpg",
    content:
      "The project-based learning approach was exactly what I needed. I completed three projects on CodeBreak, added them to my portfolio, and landed my first developer job within two months!",
    rating: 5,
  },
  {
    id: 2,
    name: "Jason Kim",
    role: "Full-stack Developer",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    content:
      "The structured roadmaps and mentor feedback helped me transition from basic coding knowledge to building complex applications. The AI assistant was incredibly helpful when I got stuck!",
    rating: 5,
  },
  {
    id: 3,
    name: "Michelle Thompson",
    role: "Data Scientist",
    avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    content:
      "I was struggling to find practical machine learning projects beyond tutorials. CodeBreak provided real-world ML projects with clean datasets and guided implementation. Exactly what I needed!",
    rating: 4.5,
  },
];
// components/TestimonialsSection.tsx
export default function TestimonialsSection() {
  return (
    <section className="py-16 bg-[#2C0053] text-white " id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4 text-white/70">
            Hear from our Users,
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-[#101d3d] rounded-lg p-6">
              <div className="flex items-center mb-4">
                {
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name} avatar`}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                }
                <div>
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>

              <p className="text-gray-300 mb-4">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex text-yellow-400">
                {Array.from({ length: Math.floor(testimonial.rating) }).map(
                  (_, i) => (
                    <Star key={i} />
                  )
                )}
                {testimonial.rating % 1 !== 0 && <StarHalf />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
