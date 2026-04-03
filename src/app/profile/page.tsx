
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileClientWrapper from '@/components/profile/ProfileClientWrapper'
import { WatermarkOverlay } from '@/components/WatermarkOverlay'

export default async function UserProfilePage() {
    const session = await getSession()
    if (!session) redirect('/auth/login?next=/profile')

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            purchases: {
                include: { design: true },
                orderBy: { createdAt: 'desc' }
            },
            likes: {
                include: { design: true },
                orderBy: { createdAt: 'desc' }
            },
            collections: {
                where: { name: 'Favorites' },
                include: {
                    items: {
                        include: { design: true },
                        orderBy: { createdAt: 'desc' }
                    }
                }
            }
        }
    })

    if (!user) redirect('/')

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    // Merge liked designs + saved (Favorites) designs, deduplicated by design ID
    const likedDesigns = user.likes.map(l => l.design)
    const savedDesigns = user.collections[0]?.items.map(i => i.design) ?? []

    const seenIds = new Set<string>()
    const mergedDesigns: typeof likedDesigns = []
    for (const d of [...savedDesigns, ...likedDesigns]) {
        if (!seenIds.has(d.id)) {
            seenIds.add(d.id)
            mergedDesigns.push(d)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <ProfileClientWrapper user={user}>
                    {/* Header Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-white dark:border-slate-800 shadow-lg">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                getInitials(user.name || user.email)
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{user.name || 'User'}</h1>
                            <p className="text-slate-500 font-mono text-sm mb-4">{user.email} • {user.phone || 'No phone'}</p>
                            {user.bio && <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{user.bio}</p>}
                        </div>

                        {/* Edit Button */}
                        <button
                            data-edit-trigger
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
                        >
                            Edit Profile
                        </button>
                    </div>
                </ProfileClientWrapper>

                <div className="space-y-12">

                    {/* Purchases Section */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 p-1.5 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            </span>
                            Purchased Designs
                        </h2>

                        {user.purchases.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.purchases.map(purchase => (
                                    <div key={purchase.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col group">
                                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                            {purchase.design.previewImages?.[0] && (
                                                <img src={purchase.design.previewImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{purchase.design.title}</h3>
                                            <p className="text-xs text-slate-500 mb-4">Purchased on {new Date(purchase.createdAt).toLocaleDateString()}</p>

                                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                                                <Link
                                                    href={`/designs/${purchase.design.id}`}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold py-2 rounded text-center"
                                                >
                                                    View Details
                                                </Link>
                                                <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded shadow-sm">
                                                    Download Files
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                                <p className="text-slate-500 mb-4">You haven't purchased any designs yet.</p>
                                <Link href="/catalog" className="text-indigo-600 font-bold hover:underline">Browse Catalog</Link>
                            </div>
                        )}
                    </section>

                    {/* Saved Designs Section (merged: liked + bookmarked, deduplicated) */}
                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 p-1.5 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                            </span>
                            Saved Designs
                            {mergedDesigns.length > 0 && (
                                <span className="ml-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-mono px-2 py-0.5 rounded-full">
                                    {mergedDesigns.length}
                                </span>
                            )}
                        </h2>

                        {mergedDesigns.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {mergedDesigns.map(design => (
                                    <Link
                                        key={design.id}
                                        href={`/designs/${design.id}`}
                                        className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all relative"
                                    >
                                        <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                            {design.previewImages?.[0] && (
                                                <img src={design.previewImages[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            )}
                                            <WatermarkOverlay />
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{design.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{design.bedrooms} Beds • {design.floors} Floors</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                                <p className="text-slate-500 mb-4">No saved designs yet. Like ❤️ or bookmark 🔖 designs from the catalog.</p>
                                <Link href="/catalog" className="text-indigo-600 font-bold hover:underline">Start Exploring</Link>
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    )
}
