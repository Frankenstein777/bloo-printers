import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="relative z-10 py-16 px-6 border-t border-slate-800 bg-brand-navy mt-auto pb-24 md:pb-16 font-sans">
      <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand Side */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/" className="cursor-none">
            <span className="text-xl font-extrabold tracking-wider text-white hover:text-brand-teal transition-colors">
              OCTOPLANS
            </span>
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Octoplans © {new Date().getFullYear()}. All rights reserved.
          </p>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-300">
          <Link href="/privacy" className="hover:text-brand-teal transition-colors cursor-none">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-brand-teal transition-colors cursor-none">
            Terms of Use
          </Link>
          <Link href="/refund" className="hover:text-brand-teal transition-colors cursor-none">
            Refund Policy
          </Link>
          <Link href="/disclaimer" className="hover:text-brand-teal transition-colors cursor-none">
            Legal Disclaimer
          </Link>
        </div>

      </div>
    </footer>
  )
}
