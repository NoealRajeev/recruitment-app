import Link from "next/link";

export default function AboutUsSection() {
  return (
    <section
      id="about us"
      className="relative w-full h-fit flex flex-col items-center justify-center text-center px-6 animate-fade-in-bg text-[#2C0053]"
    >
      {/* Heading */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide leading-tight mt-0 md:mt-40">
        Know more About Us
      </h2>

      {/* Description */}
      <p className="m-6 sm:m-10 max-w-4xl text-base leading-relaxed px-4 sm:px-6">
        Discover who we are and how we operate as a trusted partner in
        blue-collar workforce solutions. Our organization is committed to
        delivering skilled and verified manpower through a meticulously managed
        backend process. From requirement collection and candidate shortlisting
        to overseeing medical examinations, visa formalities, and deployment
        logistics, we ensure a seamless and efficient experience for our
        clients. Learn more about our values, methodology, and dedication to
        operational excellence.
      </p>

      {/* Buttons */}
      <div className="m-10 flex flex-wrap justify-center gap-4 ">
        <Link href="/about">
          <button className="text-sm font-medium bg-gradient-to-r from-[#6914A8] to-[#290842] hover:from-[#6914A8] hover:to-[#290842] hover:scale-105 transition-all duration-300 px-8 py-3 text-white rounded-xl">
            Learn More About Us
          </button>
        </Link>
      </div>
    </section>
  );
}
