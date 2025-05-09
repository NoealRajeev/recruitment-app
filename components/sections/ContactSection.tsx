export default function ContactSection() {
  return (
    <section id="contact" className="bg-[#2C0053]/20">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
        Ready to Transform Your Business?
      </h2>

      {/* Subtext */}
      <p className="mt-4 text-base sm:text-lg max-w-lg sm:max-w-2xl mx-auto">
        Join us in pushing the boundaries of what’s possible. Contact us today
        to learn more about our innovative solutions.
      </p>

      {/* Button */}
      <div className="mt-6">
        <a
          href="mailto:info@breakthroughf1.com"
          className="px-5 sm:px-6 py-2 sm:py-3 bg-white text-black font-medium rounded-lg shadow-md hover:bg-gray-200 transition"
        >
          Get in Touch
        </a>
      </div>
    </section>
  );
}
