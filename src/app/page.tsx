import Link from 'next/link'
import { FeaturedDesign } from '@/components/FeaturedDesign'

export default function Home() {
  return (
    <div className="relative min-h-screen text-gray-900 dark:text-white selection:bg-[#00f2ff] selection:text-black">

      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            OCEAN OF BLUEPRINTS
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl font-mono text-gray-700 dark:text-gray-300">
            Precision Architectural Blueprints
            <br />
            <span className="text-sm opacity-75">Est. 2026</span>
          </p>

          <div className="pt-8">
            <Link href="/browse">
              <button className="px-10 py-4 text-xl font-bold font-mono tracking-widest text-black bg-[#00f2ff] hover:bg-white hover:shadow-[0_0_30px_rgba(0,242,255,0.8)] transition-all duration-300 border-2 border-transparent hover:border-[#00f2ff] uppercase">
                Browse Catalog &gt;&gt;
              </button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 animate-bounce">
          <span className="font-mono text-xs opacity-50 uppercase">Scroll Down</span>
          <div className="w-[1px] h-12 bg-[#00f2ff]/50 mx-auto mt-2"></div>
        </div>
      </section>

      {/* FEATURED DESIGN SECTION */}
      <FeaturedDesign />

      {/* ABOUT SECTION */}
      <section id="about" className="relative z-10 py-24 px-6 md:px-20 bg-white/50 dark:bg-black/40 backdrop-blur-sm border-t border-[#00f2ff]/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold font-mono text-[#00a3ad] dark:text-[#00f2ff] mb-6 uppercase">
                Who We Are
              </h2>
              <div className="space-y-4 text-lg font-light leading-relaxed">
                <p>
                  Bloo Printers is the vanguard of digital architectural distribution.
                  We don't just sell plans; we provide the foundation for your next project.
                </p>
                <p>
                  Our database hosts verified, high-precision blueprints ready for immediate deployment.
                  From modern apartments to commercial complexes, if you can dream it, we have the schematics.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-sm">
                <div className="p-4 border border-[#00f2ff]/30 bg-[#00f2ff]/5">
                  <span className="block text-2xl font-bold">100+</span>
                  <span className="opacity-70">Blueprints</span>
                </div>
                <div className="p-4 border border-[#00f2ff]/30 bg-[#00f2ff]/5">
                  <span className="block text-2xl font-bold">Instant</span>
                  <span className="opacity-70">Access</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block h-full min-h-[400px] border border-[#00f2ff]/20 bg-[#00f2ff]/5 relative overflow-hidden">
              {/* Abstract Graphic placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-[#00f2ff] rotate-45 animate-pulse"></div>
                <div className="w-32 h-32 border-2 border-[#00a3ad] absolute -rotate-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="relative z-10 py-24 px-6 md:px-20 border-t border-[#00f2ff]/20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold font-mono text-center text-[#00a3ad] dark:text-[#00f2ff] mb-16 uppercase">
            Testimonials
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { u: "Architect X", c: "The precision is unmatched. Downloaded a villa plan and printed it directly to the site." },
              { u: "Builder 88", c: "Zero latency. Instant delivery. The future of construction is here." },
              { u: "Design Core", c: "Aesthetic and functional. Bloo Printers is the only resource we trust." }
            ].map((t, i) => (
              <div key={i} className="p-6 border border-gray-200 dark:border-gray-800 bg-white/5 backdrop-blur-sm hover:border-[#00f2ff] transition-colors group">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#00f2ff]/20 rounded-none flex items-center justify-center text-[#00f2ff]">
                    {t.u[0]}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-sm tracking-widest uppercase">{t.u}</p>
                    <p className="text-xs opacity-50 font-mono uppercase">Verified Purchase</p>
                  </div>
                </div>
                <p className="italic opacity-80">"{t.c}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative z-10 py-24 px-6 md:px-20 bg-white/50 dark:bg-black/40 backdrop-blur-sm border-t border-[#00f2ff]/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-mono text-[#00a3ad] dark:text-[#00f2ff] mb-8 uppercase">
            Contact Us
          </h2>
          <div className="p-8 border-2 border-[#00f2ff] bg-black/50 backdrop-blur-xl relative">
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#00f2ff]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#00f2ff]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#00f2ff]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#00f2ff]"></div>

            <p className="mb-8 font-mono text-lg">
              Get in touch with our support team.
            </p>

            {/* WhatsApp CTA */}
            <div className="mb-10">
              <a
                href={`https://wa.me/2347068095681?text=${encodeURIComponent("Hello, I'm reaching out from the Ocean of Blueprints landing page. I'd like to inquire about your architectural services.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center justify-center gap-3 w-full py-4 bg-green-500/10 border-2 border-green-500 text-green-500 font-mono hover:bg-green-500 hover:text-black transition-all duration-300 font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" /></svg>
                Chat on WhatsApp
              </a>
              <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-mono opacity-50 uppercase tracking-widest text-[#00f2ff]">
                <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#00f2ff]/30" />
                <span>Or send an encoded transmission</span>
                <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#00f2ff]/30" />
              </div>
            </div>

            <form className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono mb-1 text-[#00f2ff] uppercase">Email</label>
                <input type="text" className="w-full bg-transparent border-b border-gray-600 focus:border-[#00f2ff] outline-none py-2 font-mono" placeholder="Enter your email" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-1 text-[#00f2ff] uppercase">Message</label>
                <textarea className="w-full bg-transparent border-b border-gray-600 focus:border-[#00f2ff] outline-none py-2 font-mono h-32" placeholder="How can we help?"></textarea>
              </div>
              <button type="button" className="w-full py-3 bg-[#00f2ff]/10 border border-[#00f2ff] text-[#00f2ff] font-mono hover:bg-[#00f2ff] hover:text-black transition-all font-bold tracking-widest uppercase">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center text-xs font-mono opacity-50 border-t border-gray-800 uppercase">
        <p>Bloo Printers © 2026. All rights reserved.</p>
      </footer>
    </div>
  )
}
