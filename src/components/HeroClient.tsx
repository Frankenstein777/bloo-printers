'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const HERO_IMAGES = [
  '/hero-house.png',
  '/cat-bungalow.png',
  '/cat-duplex.png',
  '/cat-apartment.png',
  '/cat-villa.png',
  '/cat-commercial.png'
]

export default function HeroClient() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative overflow-hidden w-full h-[60vh] sm:h-[70vh] md:h-[75vh] flex items-center justify-center bg-black">
      {/* Background Images with cross-fade */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt="Luxury House Design Mockup"
              fill
              priority={idx === 0}
              className="object-cover object-center w-full h-full brightness-[0.4] dark:brightness-[0.3]"
            />
          </div>
        ))}
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto px-4 sm:px-6 lg:px-8 text-center text-white flex flex-col items-center justify-center space-y-5">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
          Welcome to Octoplans
        </span>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl drop-shadow-lg text-white">
          Find Your <span className="font-lora italic font-normal text-brand-teal">Dream Home</span>
        </h1>
        <p className="max-w-xl text-xs sm:text-base lg:text-lg text-slate-300 font-light leading-relaxed drop-shadow-md">
          Explore professionally designed architectural blueprints ready for construction and customization.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 pt-3 w-full sm:w-auto">
          <Link href="/catalog" className="cursor-none w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 bg-brand-teal text-white font-semibold rounded-md flex items-center justify-center gap-2 hover:bg-brand-teal/90 transition-all shadow-md hover:shadow-[0_0_20px_rgba(14,154,167,0.4)] cursor-none">
              Browse Plans
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </Link>
          <Link href="/#about" className="cursor-none w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-3.5 border-2 border-brand-teal text-brand-teal hover:text-white hover:bg-brand-teal font-semibold rounded-md flex items-center justify-center gap-2 bg-transparent transition-all cursor-none">
              How It Works
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
