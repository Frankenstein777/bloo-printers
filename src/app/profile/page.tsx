import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileClientWrapper from '@/components/profile/ProfileClientWrapper'
import { WatermarkOverlay } from '@/components/WatermarkOverlay'
import DesignImage from '@/components/DesignImage'

export default async function UserProfilePage() {
    const session = await getSession()
    if (!session) redirect('/login?callbackUrl=/profile')

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
        <div className="min-h-screen bg-muted/50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors">
            <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto">
                <ProfileClientWrapper user={user}>
                    {/* Header Section (Midnight Navy background for trust) */}
                    <div className="bg-brand-navy text-white rounded-2xl shadow-lg border border-slate-800 p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center text-3xl font-bold border-4 border-slate-800 shadow-md overflow-hidden">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                getInitials(user.name || user.email)
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-extrabold text-white mb-2">{user.name || 'User'}</h1>
                            <p className="text-slate-400 font-mono text-sm mb-4">{user.email} • {user.phone || 'No phone number'}</p>
                            {user.bio ? (
                                <p className="text-slate-350 max-w-2xl text-sm font-light leading-relaxed">{user.bio}</p>
                            ) : (
                                <p className="text-slate-500 italic text-sm">No bio added yet.</p>
                            )}
                        </div>

                        {/* Edit Button */}
                        <button
                            data-edit-trigger
                            className="bg-brand-teal hover:bg-brand-teal/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm cursor-none"
                        >
                            Edit Profile
                        </button>
                    </div>
                </ProfileClientWrapper>

                <div className="space-y-12">

                    {/* Purchases Section */}
                    <section>
                        <h2 className="text-xl font-bold text-brand-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <span className="bg-brand-teal/10 text-brand-teal p-2 rounded-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                            </span>
                            Purchased Blueprints
                        </h2>

                        {user.purchases.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.purchases.map(purchase => (
                                    <div key={purchase.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm flex flex-col group hover:border-brand-teal transition-all">
                                        <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <DesignImage
                                                src={purchase.design.previewImages?.[0]}
                                                alt={purchase.design.title}
                                                fill
                                            />
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-brand-charcoal dark:text-white text-base mb-1">{purchase.design.title}</h3>
                                                <p className="text-xs text-slate-500">Purchased on {new Date(purchase.createdAt).toLocaleDateString()}</p>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex gap-3">
                                                <Link
                                                    href={`/designs/${purchase.design.id}`}
                                                    className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 text-xs font-bold py-2.5 rounded-lg text-center transition-colors cursor-none"
                                                >
                                                    View Blueprint
                                                </Link>
                                                <button className="flex-1 bg-brand-teal hover:bg-brand-teal/90 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition-colors cursor-none">
                                                    Download Files
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center shadow-sm">
                                <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't purchased any blueprints yet.</p>
                                <Link href="/catalog" className="text-brand-teal font-bold hover:underline cursor-none">Browse Blueprint Catalog</Link>
                            </div>
                        )}
                    </section>

                    {/* Saved Designs Section (merged: liked + bookmarked, deduplicated) */}
                    <section>
                        <h2 className="text-xl font-bold text-brand-charcoal dark:text-white mb-6 flex items-center gap-2">
                            <span className="bg-brand-teal/10 text-brand-teal p-2 rounded-xl">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                            </span>
                            Saved Blueprints
                            {mergedDesigns.length > 0 && (
                                <span className="ml-2 bg-brand-teal/10 text-brand-teal text-xs font-bold px-2 py-0.5 rounded-full">
                                    {mergedDesigns.length}
                                </span>
                            )}
                        </h2>

                        {mergedDesigns.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {mergedDesigns.map(design => (
                                    <Link
                                        key={design.id}
                                        href={`/designs/${design.id}`}
                                        className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow hover:border-brand-teal transition-all relative cursor-none"
                                    >
                                        <div className="aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            <DesignImage
                                                src={design.previewImages?.[0]}
                                                alt={design.title}
                                                fill
                                            />
                                            <WatermarkOverlay />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-sm font-bold text-brand-charcoal dark:text-white truncate">{design.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{design.bedrooms} Beds • {design.floors} Floors</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center shadow-sm">
                                <p className="text-slate-500 dark:text-slate-400 mb-4">No saved designs yet. Click ❤️ or bookmark 🔖 designs in the catalog.</p>
                                <Link href="/catalog" className="text-brand-teal font-bold hover:underline cursor-none">Start Exploring</Link>
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    )
}
