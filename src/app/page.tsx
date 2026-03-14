import Link from 'next/link'
import { FeaturedDesign } from '@/components/FeaturedDesign'

const WA_NUMBER = '2347068095681'
const WA_MSG = encodeURIComponent("Hello! I'm reaching out from the Octoplans website and I'd like to inquire about your architectural services.")

export default function Home() {
  return (
    <div className="relative min-h-screen text-gray-900 dark:text-white selection:bg-[#00f2ff] selection:text-black">

      {/* HERO SECTION */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="space-y-6">
          <h1 className="text-6xl md:text-8xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
            OCTOPLANS
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
                  Octoplans is the vanguard of digital architectural distribution.
                  We don&apos;t just sell plans; we provide the foundation for your next project.
                </p>
                <p>
                  Our database hosts verified, high-precision blueprints ready for immediate deployment.
                  From modern apartments to commercial complexes, if you can dream it, we have the schematics.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4 font-mono text-sm">
                <div className="p-4 border border-[#00f2ff]/30 bg-[#00f2ff]/5">
                  <span className="block text-2xl font-bold text-[#00a3ad] dark:text-[#00f2ff]">100+</span>
                  <span className="opacity-70 text-gray-600 dark:text-gray-400">Blueprints</span>
                </div>
                <div className="p-4 border border-[#00f2ff]/30 bg-[#00f2ff]/5">
                  <span className="block text-2xl font-bold text-[#00a3ad] dark:text-[#00f2ff]">Instant</span>
                  <span className="opacity-70 text-gray-600 dark:text-gray-400">Access</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block h-full min-h-[400px] border border-[#00f2ff]/20 bg-[#00f2ff]/5 relative overflow-hidden">
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
              { u: "Design Core", c: "Aesthetic and functional. Octoplans is the only resource we trust." }
            ].map((t, i) => (
              <div key={i} className="p-6 border border-gray-200 dark:border-gray-800 bg-white/5 backdrop-blur-sm hover:border-[#00f2ff] transition-colors group text-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#00f2ff]/20 rounded-none flex items-center justify-center text-[#00f2ff]">
                    {t.u[0]}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-sm tracking-widest uppercase text-white">{t.u}</p>
                    <p className="text-xs opacity-50 font-mono uppercase">Verified Purchase</p>
                  </div>
                </div>
                <p className="italic opacity-80 text-gray-200">&quot;{t.c}&quot;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="relative z-10 py-24 px-6 md:px-20 bg-white/50 dark:bg-black/40 backdrop-blur-sm border-t border-[#00f2ff]/20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-mono text-[#00a3ad] dark:text-[#00f2ff] mb-4 uppercase">
            Contact Us
          </h2>
          <p className="font-mono text-gray-500 dark:text-gray-400 mb-10">
            Reach out on WhatsApp or follow us on social media.
          </p>

          <div className="p-8 border-2 border-[#00f2ff] bg-black/50 backdrop-blur-xl relative space-y-4">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#00f2ff]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#00f2ff]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#00f2ff]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#00f2ff]"></div>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 w-full py-4 bg-green-500/10 border-2 border-green-500 text-green-400 font-mono hover:bg-green-500 hover:text-black transition-all duration-300 font-bold tracking-[0.2em] uppercase shadow-[0_0_15px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              Chat on WhatsApp
            </a>

            <div className="flex items-center gap-3 text-[10px] font-mono opacity-40 uppercase tracking-widest text-[#00f2ff]">
              <div className="h-[1px] flex-grow bg-[#00f2ff]/30" />
              <span>or follow us</span>
              <div className="h-[1px] flex-grow bg-[#00f2ff]/30" />
            </div>

            {/* Social Media row */}
            <div className="flex justify-center gap-4">
              {/* Instagram */}
              <a
                href="https://instagram.com/octoplans"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 transition-all font-mono text-sm uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                Instagram
              </a>

              {/* X / Twitter */}
              <a
                href="https://x.com/octoplans"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-gray-500/50 text-gray-300 hover:bg-gray-500/10 hover:border-gray-300 transition-all font-mono text-sm uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                X (Twitter)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-8 text-center text-xs font-mono opacity-50 border-t border-gray-800 uppercase text-gray-300 dark:text-gray-500">
        <p>Octoplans © 2026. All rights reserved.</p>
      </footer>
    </div>
  )
}
