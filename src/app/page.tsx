import Link from 'next/link'
import { FeaturedDesign } from '@/components/FeaturedDesign'
import { TestimonialList } from '@/components/TestimonialList'

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
            <Link href="/catalog">
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

          <TestimonialList />
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
            <div className="flex flex-wrap justify-center gap-4">
              {/* Facebook */}
              <a
                href="https://facebook.com/octoplans"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-blue-600/50 text-blue-500 hover:bg-blue-600/10 hover:border-blue-500 transition-all font-mono text-sm uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.96 3.63 9.08 8.4 9.83v-6.95h-2.53v-2.88h2.53v-2.19c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.86h2.78l-.44 2.88h-2.34v6.95c4.78-.75 8.4-4.87 8.4-9.83 0-5.5-4.46-9.96-9.96-9.96z" /></svg>
                Facebook
              </a>

              {/* TikTok */}
              <a
                href="https://tiktok.com/@octoplans"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-3 border border-gray-400/50 text-gray-200 hover:bg-gray-400/10 hover:border-gray-200 transition-all font-mono text-sm uppercase tracking-wider"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                TikTok
              </a>

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
