import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import SearchBar from '@/components/SearchBar'
import DesignCard from '@/components/design-card'
import { getActiveDiscount } from '@/app/actions'
import { getSeededDiscountPct } from '@/lib/discount'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 30

export default async function CatalogPage({
    searchParams,
}: {
    searchParams: Promise<{
        q?: string
        minBedrooms?: string
        minFloors?: string
        matchMode?: string
        minArea?: string
        maxArea?: string
        hasPenthouse?: string
        hasBQ?: string
        sw_REVIT?: string
        sw_ARCHICAD?: string
        sw_SKETCHUP?: string
        sw_AUTOCAD?: string
        sw_PDF?: string
        page?: string
    }>
}) {
    const session = await getSession()
    const params = await searchParams

    const query = params.q
    const currentPage = Math.max(1, parseInt(params.page || '1'))

    // Parse filters
    const minBedrooms = parseInt(params.minBedrooms || '0')
    const minFloors = parseInt(params.minFloors || '0')
    const matchMode = params.matchMode === 'exact' ? 'exact' : 'min'
    const minArea = parseFloat(params.minArea || '0')
    const maxArea = parseFloat(params.maxArea || '999999')
    const hasPenthouse = params.hasPenthouse === 'true'
    const hasBQ = params.hasBQ === 'true'

    const swParams = ['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF']
    const activeSoftware = swParams.filter(sw => params[`sw_${sw}` as keyof typeof params] === 'true')

    // Fetch ALL matching designs (needed for shuffle before paginating)
    const allDesigns = await prisma.design.findMany({
        where: {
            AND: [
                query
                    ? {
                          OR: [
                              { title: { contains: query, mode: 'insensitive' } },
                              { description: { contains: query, mode: 'insensitive' } },
                          ],
                      }
                    : {},
                { bedrooms: matchMode === 'exact' && minBedrooms > 0 ? { equals: minBedrooms } : { gte: minBedrooms } },
                { floors: matchMode === 'exact' && minFloors > 0 ? { equals: minFloors } : { gte: minFloors } },
                { plotArea: { gte: minArea, lte: maxArea } },
                hasPenthouse ? { hasPenthouse: true } : {},
                hasBQ ? { hasBQ: true } : {},
                ...(activeSoftware.length > 0
                    ? [{ fileTypes: { hasSome: activeSoftware } }]
                    : []),
            ],
        },
        orderBy: { createdAt: 'desc' },
    })

    // Fisher-Yates shuffle on the full result set
    const shuffled = [...allDesigns]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    const totalDesigns = shuffled.length
    const totalPages = Math.max(1, Math.ceil(totalDesigns / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const designs = shuffled.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

    // Build URL helper that preserves all current params except page
    const buildPageUrl = (page: number) => {
        const p = new URLSearchParams()
        if (query) p.set('q', query)
        if (params.minBedrooms) p.set('minBedrooms', params.minBedrooms)
        if (params.minFloors) p.set('minFloors', params.minFloors)
        if (params.matchMode) p.set('matchMode', params.matchMode)
        if (params.minArea) p.set('minArea', params.minArea)
        if (params.maxArea) p.set('maxArea', params.maxArea)
        if (params.hasPenthouse) p.set('hasPenthouse', params.hasPenthouse)
        if (params.hasBQ) p.set('hasBQ', params.hasBQ)
        swParams.forEach(sw => {
            const key = `sw_${sw}` as keyof typeof params
            if (params[key]) p.set(key, params[key] as string)
        })
        p.set('page', String(page))
        return `/catalog?${p.toString()}`
    }

    // Fetch user likes
    let likesMap: Record<string, boolean> = {}
    if (session) {
        const userLikes = await prisma.like.findMany({
            where: { userId: session.user.id },
            select: { designId: true },
        })
        userLikes.forEach(like => { likesMap[like.designId] = true })
    }

    // Fetch user saved (Favorites collection)
    let savedMap: Record<string, boolean> = {}
    if (session) {
        const favCollection = await prisma.collection.findFirst({
            where: { userId: session.user.id, name: 'Favorites' },
            include: { items: { select: { designId: true } } },
        })
        if (favCollection) {
            favCollection.items.forEach(item => { savedMap[item.designId] = true })
        }
    }

    // Fetch like counts for current page
    const allLikes = await prisma.like.findMany({
        where: { designId: { in: designs.map(d => d.id) } },
    })
    const likeCounts: Record<string, number> = {}
    allLikes.forEach(like => {
        likeCounts[like.designId] = (likeCounts[like.designId] || 0) + 1
    })

    const activeDiscount = await getActiveDiscount()

    return (
        <div className="min-h-screen pt-20 pb-20 px-4 sm:px-6 lg:px-8 relative z-10 pointer-events-auto">
            <div className="max-w-screen-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold font-mono tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl mb-4">
                        <span className="text-[#00a3ad] dark:text-[#00f2ff]">CATALOG</span>_BROWSER
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl font-mono">
                        Explore our repository of futuristic blueprints.
                    </p>
                </div>

                {/* Search + filter bar */}
                <div className="flex justify-center mb-8">
                    <SearchBar />
                </div>

                {/* Results count */}
                {totalDesigns > 0 && (
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            SHOWING <span className="text-[#00f2ff]">{(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, totalDesigns)}</span> OF <span className="text-[#00f2ff]">{totalDesigns}</span> DESIGNS
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            PAGE <span className="text-[#00f2ff]">{safePage}</span> / {totalPages}
                        </p>
                    </div>
                )}

                {/* Results Grid */}
                {designs.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <p className="text-xl text-gray-500 font-mono">NO_DATA_FOUND</p>
                        <p className="text-sm text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:gap-4">
                        {designs.map(design => {
                            const discountPct = activeDiscount
                                ? getSeededDiscountPct(
                                      activeDiscount.id,
                                      design.id,
                                      activeDiscount.percentageMin,
                                      activeDiscount.percentageMax,
                                  )
                                : 0
                            return (
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
                                    isSaved={!!savedMap[design.id]}
                                    userEmail={session?.user.email || undefined}
                                    discountPct={discountPct}
                                />
                            )
                        })}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-12">
                        {safePage > 1 ? (
                            <Link
                                href={buildPageUrl(safePage - 1)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-mono text-sm uppercase tracking-wide hover:bg-[#00f2ff]/10 hover:text-[#00f2ff] border border-gray-200 dark:border-gray-700 hover:border-[#00f2ff] transition-all"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                                Prev
                            </Link>
                        ) : (
                            <span className="flex items-center gap-2 px-5 py-2.5 font-mono text-sm uppercase tracking-wide opacity-30 cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                <ChevronLeftIcon className="h-4 w-4" />
                                Prev
                            </span>
                        )}

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...')
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, idx) =>
                                    p === '...' ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-mono text-sm">…</span>
                                    ) : (
                                        <Link
                                            key={p}
                                            href={buildPageUrl(p as number)}
                                            className={`w-9 h-9 flex items-center justify-center font-mono text-sm border transition-all ${
                                                p === safePage
                                                    ? 'bg-[#00f2ff] text-black border-[#00f2ff] font-bold shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#00f2ff] hover:text-[#00f2ff]'
                                            }`}
                                        >
                                            {p}
                                        </Link>
                                    ),
                                )}
                        </div>

                        {safePage < totalPages ? (
                            <Link
                                href={buildPageUrl(safePage + 1)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-mono text-sm uppercase tracking-wide hover:bg-[#00f2ff]/10 hover:text-[#00f2ff] border border-gray-200 dark:border-gray-700 hover:border-[#00f2ff] transition-all"
                            >
                                Next
                                <ChevronRightIcon className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span className="flex items-center gap-2 px-5 py-2.5 font-mono text-sm uppercase tracking-wide opacity-30 cursor-not-allowed border border-gray-200 dark:border-gray-700">
                                Next
                                <ChevronRightIcon className="h-4 w-4" />
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
