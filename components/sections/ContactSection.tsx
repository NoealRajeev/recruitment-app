import { Clock, Globe, Mail, MessageCircle, Phone } from "lucide-react";

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="bg-[#E3D7EB] py-10 text-[#2C0053] text-center"
      aria-label="Contact"
    >
      {/* Heading */}
      <div className="px-4">
        <h1 className="text-xl sm:text-2xl font-light">Connect</h1>
        <span className="block text-sm sm:text-base font-light mt-1">with</span>
        <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-6">findly</h2>
      </div>

      {/* Contact Info */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 text-base sm:text-lg mb-8 px-4">
        <a
          href="tel:+18001234567"
          className="flex items-center gap-2 hover:opacity-90 transition"
          aria-label="Call +1 800 123 4567"
        >
          <Phone className="shrink-0" />
          <span>+1 (800) 123-4567</span>
        </a>

        <span className="hidden sm:inline select-none">•</span>

        <a
          href="mailto:support@findly.com"
          className="flex items-center gap-2 hover:opacity-90 transition"
          aria-label="Email support at findly dot com"
        >
          <Mail className="shrink-0" />
          <span>support@findly.com</span>
        </a>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto text-left px-6 sm:px-4 text-sm sm:text-base text-[#70528A]">
        {/* Support Hours */}
        <div className="flex items-start gap-3">
          <Clock size={30} className="mt-1 shrink-0" />
          <div>
            <h3 className="font-medium text-[#2C0053]">Support Hours</h3>
            <p>Monday to Friday: 9 AM – 6 PM</p>
            <p>Saturday: 10 AM – 2 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        {/* Live Chat */}
        <div className="flex items-start gap-3">
          <MessageCircle size={30} className="mt-1 shrink-0" />
          <div className="w-full">
            <h3 className="font-medium text-[#2C0053]">Live Chat</h3>
            <p>Got a quick question?</p>
            <button
              type="button"
              className="mt-4 bg-[#5D3E7E] text-white px-4 py-2 rounded-[8px] hover:bg-[#452a66] transition w-full sm:w-auto"
              aria-label="Open live chat"
              // onClick={() => openChat()} // hook up when ready
            >
              Chat
            </button>
          </div>
        </div>

        {/* Global Presence */}
        <div className="flex items-start gap-3">
          <Globe size={30} className="mt-1 shrink-0" />
          <div>
            <h3 className="font-medium text-[#2C0053]">Global Presence</h3>
            <p>UAE • India • Saudi Arabia</p>
            <p>15+ Countries</p>
          </div>
        </div>
      </div>
    </section>
  );
}
