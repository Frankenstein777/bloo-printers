import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth'
import SearchInput from '@/components/SearchInput'
import { FilterSidebar } from '@/components/FilterSidebar'
import { SocialActions } from '@/components/social-actions'
import DesignCard from '@/components/design-card'

const prisma = new PrismaClient()

// Force dynamic rendering since we rely on searchParams and session
export const dynamic = 'force-dynamic'

export default async function BrowsePage({ searchParams }: { searchParams: Promise<{ q?: string, minBedrooms?: string, minFloors?: string, matchMode?: string, minArea?: string, maxArea?: string, hasPenthouse?: string, hasBQ?: string, sw_REVIT?: string, sw_ARCHICAD?: string, sw_SKETCHUP?: string, sw_AUTOCAD?: string, sw_PDF?: string }> }) {
    const session = await getSession()
    const params = await searchParams
    const query = params.q

    console.log('[BrowsePage] PARAMS:', params)

    // Parse filters
    const minBedrooms = parseInt(params.minBedrooms || '0')
    const minFloors = parseInt(params.minFloors || '0')
    const matchMode = params.matchMode === 'exact' ? 'exact' : 'min'
    const minArea = parseFloat(params.minArea || '0')
    const maxArea = parseFloat(params.maxArea || '999999')
    const hasPenthouse = params.hasPenthouse === 'true'
    const hasBQ = params.hasBQ === 'true'

    // Software Filters
    const swParams = ['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF']
    const activeSoftware = swParams.filter(sw => params[`sw_${sw}` as keyof typeof params] === 'true')

    // Fetch Designs
    const designs = await prisma.design.findMany({
        where: {
            AND: [
                query ? {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { description: { contains: query, mode: 'insensitive' } }
                    ]
                } : {},
                { bedrooms: matchMode === 'exact' && minBedrooms > 0 ? { equals: minBedrooms } : { gte: minBedrooms } },
                { floors: matchMode === 'exact' && minFloors > 0 ? { equals: minFloors } : { gte: minFloors } },
                { plotArea: { gte: minArea, lte: maxArea } },
                hasPenthouse ? { hasPenthouse: true } : {},
                hasBQ ? { hasBQ: true } : {},
                ...(activeSoftware.length > 0 ? [{
                    fileTypes: {
                        hasSome: activeSoftware
                    }
                }] : [])
            ]
        },
        orderBy: { createdAt: 'desc' }
    })

    console.log(`[BrowsePage] FOUND: ${designs.length} designs. Filters: Mode=${matchMode}, Area=${minArea}-${maxArea}`)

    // Fetch user likes if logged in
    let likesMap: Record<string, boolean> = {}
    if (session) {
        const userLikes = await prisma.like.findMany({
            where: { userId: session.user.id },
            select: { designId: true }
        })
        userLikes.forEach(like => {
            likesMap[like.designId] = true
        })
    }

    // Fetch Like counts
    const allLikes = await prisma.like.findMany({
        where: {
            designId: { in: designs.map(d => d.id) }
        }
    })

    const likeCounts: Record<string, number> = {}
    allLikes.forEach(like => {
        likeCounts[like.designId] = (likeCounts[like.designId] || 0) + 1
    })


    return (
        <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-auto">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-mono tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-4">
                        <span className="text-[#00a3ad] dark:text-[#00f2ff]">CATALOG</span>_BROWSER
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl font-mono">
                        Explore our repository of futuristic blueprints.
                    </p>
                </div>

                <div className="flex justify-center mb-8">
                    <SearchInput />
                </div>

                <div className="lg:flex lg:gap-8">
                    {/* Sidebar Filter */}
                    <div className="flex-shrink-0">
                        <FilterSidebar />
                    </div>

                    {/* Results Grid */}
                    <div className="flex-1">
                        {designs.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-xl text-gray-500 font-mono">NO_DATA_FOUND</p>
                                <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                                {designs.map((design) => (
                                    <DesignCard
                                        key={design.id}
                                        design={{
                                            ...design,
                                            price: design.price ? Number(design.price) : null,
                                            priceRender: Number(design.priceRender || 0),
                                            priceDwg: Number(design.priceDwg || 0),
                                            pricePdf: Number(design.pricePdf || 0),
                                            priceElec: Number(design.priceElec || 0),
                                            priceMech: Number(design.priceMech || 0),
                                            priceStruct: Number(design.priceStruct || 0),
                                        }}
                                        initialLikes={likeCounts[design.id] || 0}
                                        isLiked={!!likesMap[design.id]}
                                        userEmail={session?.user.email || undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
