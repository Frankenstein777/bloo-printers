import { PrismaClient } from '@prisma/client'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SearchInput from '@/components/admin/SearchInput'

const prisma = new PrismaClient()

interface PageProps {
    searchParams: Promise<{ q?: string }>
}

export default async function AdminDesignsPage({ searchParams }: PageProps) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') redirect('/')

    const query = (await searchParams).q || ''

    const designs = await prisma.design.findMany({
        where: query ? {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            purchases: { select: { id: true } },
            likes: { select: { id: true } }
        }
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Design Manager</h1>
                        <p className="text-slate-500 mt-1">
                            {query ? `Found ${designs.length} results for "${query}"` : `Manage ${designs.length} listed designs`}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <SearchInput />
                        <Link
                            href="/admin/upload"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <span>+ Upload New</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {designs.map(design => (
                        <Link
                            key={design.id}
                            href={`/admin/designs/${design.id}`}
                            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group shadow-sm hover:shadow-md block"
                        >
                            {/* Image Preview */}
                            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                {design.previewImages?.[0] ? (
                                    <img
                                        src={design.previewImages[0]}
                                        alt={design.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        No Image
                                    </div>
                                )}

                                {design.isFeatured && (
                                    <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        FEATURED
                                    </div>
                                )}

                                <div className="absolute bottom-2 left-2 flex gap-1">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shadow-sm ${design.tier === 'FREE' ? 'bg-green-100 text-green-800' :
                                            design.tier === 'PREMIUM' ? 'bg-blue-100 text-blue-800' :
                                                'bg-purple-100 text-purple-800'
                                        }`}>
                                        {design.tier}
                                    </span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{design.title}</h3>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 mb-3">
                                    <span>{new Date(design.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{design.bedrooms} Beds</span>
                                    <span>•</span>
                                    <span>{design.floors} Floors</span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex gap-3 text-xs text-slate-400 font-mono">
                                        <div className="flex items-center gap-1" title="Sales">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            {design.purchases.length}
                                        </div>
                                        <div className="flex items-center gap-1" title="Likes">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                            {design.likes.length}
                                        </div>
                                    </div>
                                    <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline">Edit →</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {designs.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-slate-100 dark:bg-slate-900/50 rounded-xl border-dashed border-2 border-slate-300 dark:border-slate-700">
                            <p className="text-slate-500 mb-4">{query ? `No results for "${query}"` : 'No designs found.'}</p>
                            {query ? (
                                <Link href="/admin/designs" className="text-indigo-600 font-bold hover:underline">Clear Search</Link>
                            ) : (
                                <Link href="/admin/upload" className="text-indigo-600 font-bold hover:underline">Upload your first design</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
