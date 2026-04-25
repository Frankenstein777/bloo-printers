import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 py-12 px-6 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Brand Side */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/">
            <span className="text-xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff]">
              OCTOPLANS
            </span>
          </Link>
          <p className="mt-2 text-xs font-mono opacity-60 text-gray-700 dark:text-gray-400 uppercase">
            Octoplans © {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-mono uppercase tracking-widest text-gray-600 dark:text-gray-400">
          <Link href="/privacy" className="hover:text-[#00a3ad] dark:hover:text-[#00f2ff] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#00a3ad] dark:hover:text-[#00f2ff] transition-colors">
            Terms of Use
          </Link>
          <Link href="/refund" className="hover:text-[#00a3ad] dark:hover:text-[#00f2ff] transition-colors">
            Refund Policy
          </Link>
          <Link href="/disclaimer" className="hover:text-[#00a3ad] dark:hover:text-[#00f2ff] transition-colors">
            Legal Disclaimer
          </Link>
        </div>

      </div>
    </footer>
  )
}
