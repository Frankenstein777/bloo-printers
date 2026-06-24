import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import DesignImage from '@/components/DesignImage'
import { WatermarkOverlay } from './WatermarkOverlay'

async function getFeaturedDesign() {
    const featured = await prisma.design.findFirst({
        where: { 
            isFeatured: true,
            OR: [ { tier: { not: 'ONETIME' } }, { purchases: { none: {} } } ]
        },
    })

    // Fallback if no featured design is set
    if (!featured) {
        return await prisma.design.findFirst({
            where: {
                OR: [ { tier: { not: 'ONETIME' } }, { purchases: { none: {} } } ]
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    return featured
}

export async function FeaturedDesign() {
    const design = await getFeaturedDesign()

    if (!design) return null

    return (
        <section className="relative z-10 py-24 px-6 md:px-20 border-t border-slate-200 dark:border-slate-800 bg-black/40 backdrop-blur-sm">
            <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto">
                <h2 className="text-4xl font-bold font-mono text-center text-brand-teal mb-16 uppercase tracking-widest">
                    Design of the Week
                </h2>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative group rounded-xl overflow-hidden border-2 border-brand-teal/50 hover:border-brand-teal transition-all duration-500 shadow-[0_0_30px_rgba(14,154,167,0.15)] hover:shadow-[0_0_50px_rgba(14,154,167,0.3)]">
                        <div className="aspect-w-16 aspect-h-9 relative min-h-[400px]">
                            <WatermarkOverlay />
                            <DesignImage
                                src={design.previewImages[0]}
                                alt={design.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 bg-brand-teal text-white font-mono font-bold px-4 py-1 text-sm uppercase tracking-wider">
                                FEATURED_SELECTION
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-3xl md:text-5xl font-black font-mono text-white tracking-tighter uppercase">
                            {design.title}
                        </h3>
                        <div className="flex items-center space-x-4 font-mono text-sm text-brand-teal">
                            <span className="bg-brand-teal/10 px-3 py-1 border border-brand-teal/30 rounded">
                                {design.bedrooms} BEDS
                            </span>
                            <span className="bg-brand-teal/10 px-3 py-1 border border-brand-teal/30 rounded">
                                {design.floors} FLOORS
                            </span>
                            <span className="bg-brand-teal/10 px-3 py-1 border border-brand-teal/30 rounded">
                                {design.plotSize}
                            </span>
                        </div>
                        <p className="text-gray-400 font-mono text-lg leading-relaxed line-clamp-3">
                            {design.description}
                        </p>
                        <div className="pt-8 flex items-center space-x-6">
                            <Link href={`/designs/${design.id}`}>
                                <button className="px-8 py-4 bg-brand-teal text-white font-bold font-mono text-xl uppercase tracking-widest hover:bg-brand-teal/80 hover:shadow-[0_0_30px_rgba(14,154,167,0.4)] transition-all cursor-none">
                                    View Specs
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

