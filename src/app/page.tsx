import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getActiveDiscount } from '@/app/actions'
import { getSeededDiscountPct } from '@/lib/discount'
import DesignImage from '@/components/DesignImage'
import HeroClient from '@/components/HeroClient'

const WA_NUMBER = '2347068095681'
const WA_MSG = encodeURIComponent("Hello! I'm reaching out from the Octoplans website and I'd like to inquire about your architectural services.")

async function getFeaturedDesigns() {
  // Fetch up to 4 featured designs
  const designs = await prisma.design.findMany({
    where: {
      OR: [
        { isFeatured: true },
        { tier: 'PREMIUM' }
      ]
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })
  
  // Fallback to any designs if none matching
  if (designs.length === 0) {
    return await prisma.design.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' }
    })
  }
  return designs
}

export default async function Home() {
  const session = await getSession()
  const featuredPlans = await getFeaturedDesigns()
  const activeDiscount = await getActiveDiscount()

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      
      {/* 1. HERO SECTION */}
      <HeroClient />

      {/* 2. TRUST/FEATURES BANNER */}
      <section className="bg-brand-grey dark:bg-[#111a36]/30 border-y border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl 2xl:max-w-[95rem] mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Instant Download</span>
          </div>
          <span className="hidden sm:inline text-slate-350 dark:text-slate-800">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Verified Architects</span>
          </div>
          <span className="hidden sm:inline text-slate-350 dark:text-slate-800">|</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-brand-teal" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Payments</span>
          </div>
        </div>
      </section>

      {/* 3. DARK SEARCH & FILTER PANEL */}
      <section className="px-4 sm:px-6 lg:px-8 -mt-6 max-w-screen-2xl 2xl:max-w-[95rem] mx-auto relative z-20">
        <div className="bg-brand-navy text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800">
          <form action="/catalog" method="GET" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            
            {/* Search Input (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                name="q"
                type="text"
                placeholder="Search for plans, styles or keywords..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-teal"
              />
            </div>

            {/* Category Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                name="category"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-brand-teal"
              >
                <option value="">All Categories</option>
                <option value="Bungalow">Bungalows</option>
                <option value="Duplex">Duplexes</option>
                <option value="Apartment">Apartments</option>
                <option value="Villa">Villas</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* Bedrooms Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                name="minBedrooms"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-brand-teal"
              >
                <option value="0">Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4 Bedrooms</option>
                <option value="5">5+ Bedrooms</option>
              </select>
            </div>

            {/* Price Range Filter (2 cols) */}
            <div className="lg:col-span-2">
              <select
                name="priceRange"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-brand-teal"
              >
                <option value="">Price Range</option>
                <option value="free">Free Plans</option>
                <option value="under50k">Under ₦50,000</option>
                <option value="50k-100k">₦50,000 - ₦100,000</option>
                <option value="over100k">Over ₦100,000</option>
              </select>
            </div>

            {/* Search Button (1 col) */}
            <div className="lg:col-span-1">
              <button
                type="submit"
                className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-1 transition-all cursor-none"
              >
                <span className="lg:hidden">Search</span>
                <svg className="w-5 h-5 hidden lg:block" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

          </form>

          {/* Quick Filters row */}
          <div className="mt-4 flex flex-wrap gap-2 items-center text-xs text-slate-400">
            <span className="font-semibold text-slate-300 mr-2">Quick Tags:</span>
            {[
              { label: '3 Bedroom', link: '/catalog?minBedrooms=3' },
              { label: 'Duplex', link: '/catalog?category=Duplex' },
              { label: 'Bungalow', link: '/catalog?category=Bungalow' },
              { label: 'Modern', link: '/catalog?q=Modern' },
              { label: 'Contemporary', link: '/catalog?q=Contemporary' },
              { label: 'Tiny House', link: '/catalog?q=Tiny' },
              { label: 'Luxury', link: '/catalog?q=Luxury' },
              { label: 'Commercial', link: '/catalog?category=Commercial' },
            ].map(tag => (
              <Link
                key={tag.label}
                href={tag.link}
                className="bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-full hover:border-brand-teal hover:text-white transition-colors cursor-none"
              >
                {tag.label}
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 4. BROWSE BY CATEGORY SECTION */}
      <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 max-w-screen-2xl 2xl:max-w-[95rem] mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
              Browse by Category
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Explore our curated collections of standard building designs</p>
          </div>
          <Link href="/catalog" className="text-brand-teal hover:text-brand-teal/80 font-semibold text-sm flex items-center gap-1 cursor-none">
            View all categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {[
            { name: 'Bungalows', count: '245+ Plans', img: '/cat-bungalow.png', badgeBg: 'bg-green-500', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', link: '/catalog?category=Bungalow' },
            { name: 'Duplexes', count: '180+ Plans', img: '/cat-duplex.png', badgeBg: 'bg-cyan-500', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', link: '/catalog?category=Duplex' },
            { name: 'Apartments', count: '120+ Plans', img: '/cat-apartment.png', badgeBg: 'bg-teal-600', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1', link: '/catalog?category=Apartment' },
            { name: 'Villas', count: '95+ Plans', img: '/cat-villa.png', badgeBg: 'bg-orange-500', icon: 'M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.07 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z', link: '/catalog?q=Villa' },
            { name: 'Commercial', count: '60+ Plans', img: '/cat-commercial.png', badgeBg: 'bg-blue-600', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', link: '/catalog?category=Commercial' },
          ].map(cat => (
            <Link
              key={cat.name}
              href={cat.link}
              className="group bg-card rounded-xl overflow-hidden shadow border border-slate-200 dark:border-slate-800 flex flex-col hover:border-brand-teal transition-all relative cursor-none"
            >
              {/* Photo Area */}
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-850">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Circular Overlapping Badge */}
                <div className={`absolute -bottom-5 left-4 w-10 h-10 rounded-full flex items-center justify-center text-white ${cat.badgeBg} border-2 border-white dark:border-slate-900 shadow-md z-10`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                  </svg>
                </div>
              </div>

              {/* Title Area */}
              <div className="p-4 pt-6 flex-1 flex flex-col justify-end">
                <h3 className="font-bold text-brand-charcoal dark:text-white text-base leading-none">
                  {cat.name}
                </h3>
                <p className="text-slate-400 text-xs font-mono mt-1">{cat.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. FEATURED PLANS SECTION */}
      <section className="py-20 bg-brand-grey dark:bg-[#111a36]/30 border-y border-slate-200 dark:border-slate-850 px-4 sm:px-6 lg:px-8">
        <div className="max-w-screen-2xl 2xl:max-w-[95rem] mx-auto">
          
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
                Featured Plans
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Our top verified models ready for immediate deployment</p>
            </div>
            <Link href="/catalog" className="text-brand-teal hover:text-brand-teal/80 font-semibold text-sm flex items-center gap-1 cursor-none">
              View all plans
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Grid Layout of Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlans.map(design => {
              const basePrice = Number(design.priceRender || design.price || 0)
              const discountPct = activeDiscount
                ? getSeededDiscountPct(activeDiscount.id, design.id, activeDiscount.percentageMin, activeDiscount.percentageMax)
                : 0
              const discountedPrice = discountPct > 0 ? Math.round(basePrice * (1 - discountPct / 100)) : basePrice

              return (
                <div
                  key={design.id}
                  className="group bg-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow hover:border-brand-teal transition-all flex flex-col relative"
                >
                  {/* Card Thumbnail */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800">
                    <DesignImage
                      src={design.previewImages?.[0]}
                      alt={design.title}
                      fill
                    />
                    {/* Favorite Heart (absolute top right) */}
                    <button className="absolute top-3 right-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 p-2 rounded-full shadow-md z-10 transition-colors cursor-none">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {/* Tier Tag (absolute top left) */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded shadow-sm tracking-wider ${
                        design.tier === 'FREE' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                        design.tier === 'PREMIUM' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                      }`}>
                        {design.tier}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/designs/${design.id}`} className="cursor-none">
                        <h3 className="font-bold text-brand-charcoal dark:text-white text-base hover:text-brand-teal transition-colors line-clamp-1">
                          {design.title}
                        </h3>
                      </Link>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-1">
                        {design.bedrooms} Beds • {design.floors} Floors • {design.plotSize}
                      </p>
                    </div>

                    {/* Price and Rating row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div>
                        {discountPct > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] line-through text-slate-400">₦{basePrice.toLocaleString()}</span>
                            <span className="font-extrabold text-brand-teal text-base leading-none">₦{discountedPrice.toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-brand-charcoal dark:text-white text-base">
                            {design.tier === 'FREE' ? 'FREE' : `₦${basePrice.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      
                      {/* Rating Mock */}
                      <div className="flex items-center gap-1 text-xs">
                        <svg className="w-3.5 h-3.5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-yellow-600 dark:text-yellow-500 font-bold">4.8</span>
                        <span className="text-slate-400 text-[10px]">(18)</span>
                      </div>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 6. WHY CHOOSE OCTOPLANS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-screen-2xl 2xl:max-w-[95rem] mx-auto font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core benefits */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
                Why Choose Octoplans?
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">We provide high precision blueprints that streamline your construction project</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-brand-charcoal dark:text-white text-sm">High Quality Plans</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Professionally structured layout blueprints designed by experienced architects.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-brand-charcoal dark:text-white text-sm">Instant Downloads</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Get immediate download keys to your purchased blueprints right in your account dashboard.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-brand-charcoal dark:text-white text-sm">Customization Support</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Direct support on WhatsApp to customize layouts to fit your specific plot sizing.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <svg className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-bold text-brand-charcoal dark:text-white text-sm">Secure & Reliable</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Secure payment processing with 100% money-back guarantee policy protection.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Statistics */}
          <div className="lg:col-span-5 bg-brand-grey dark:bg-[#111a36]/50 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col justify-center divide-y divide-slate-200 dark:divide-slate-800">
            <div className="pb-6">
              <span className="text-5xl font-black text-brand-teal block">10,000+</span>
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1 block">Happy Customers Globally</span>
            </div>
            <div className="pt-6">
              <span className="text-5xl font-black text-brand-teal block">2,500+</span>
              <span className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1 block">Blueprints Sold Online</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  )
}
