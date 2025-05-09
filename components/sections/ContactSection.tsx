import { Clock, Globe, Mail, MessageCircle, Phone } from "lucide-react"

export default function ContactSection() {
  return (
    <section id="contact" className="bg-[#E3D7EB] py-10 text-[#2C0053] text-center">
      <h1 className="text-xl sm:text-2xl font-light">Connect </h1>
      <span className="text-sm sm:text-base font-light ml-21 mb-15">with</span>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">findly</h1>

      {/* Contact Info */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-lg mb-6">
        <div className="flex items-center gap-2">
          <Phone/> <span>+1 (800) 123-4567</span>
        </div>
        <span className="hidden sm:inline">•</span>
        <div className="flex items-center gap-2">
          <Mail/> <span>support@findly.com</span>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto text-left px-6 sm:px-0 text-sm sm:text-base text-[#70528A]">
        {/* Support Hours */}
        <div className="flex items-start gap-3">
          <Clock size={30} className="mt-1" />
          <div>
            <h4 className="Medium">Support Hours</h4>
            <p>Monday to Friday: 9 AM – 6 PM</p>
            <p>Saturday: 10 AM – 2 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>

        {/* Live Chat */}
        <div className="flex items-start gap-3">
          <MessageCircle size={30} className="mt-1" />
          <div>
            <h4 className="Medium">Live Chat</h4>
            <p className="">Got a quick question?</p>
            <button className="mt-6 bg-[#5D3E7E] text-white px-4 py-0.5 rounded-[8px] hover:bg-[#452a66] transition w-full">
              Chat
            </button>
          </div>
        </div>

        {/* Global Presence */}
        <div className="flex items-start gap-3">
          <Globe size={30} className="mt-1" />
          <div>
            <h4 className="Medium">Global Presence</h4>
            <p>UAE • India • Saudi Arabia</p>
            <p>15+ Countries</p>
          </div>
        </div>
      </div>
    </section>
  );
}
