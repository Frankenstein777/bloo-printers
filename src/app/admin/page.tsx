
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function AdminDashboardPage() {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') redirect('/')

    // Metrics
    const [
        totalDesigns,
        totalUsers,
        totalSales,
        recentSales
    ] = await Promise.all([
        prisma.design.count(),
        prisma.user.count(),
        prisma.purchase.aggregate({ _sum: { amount: true } }),
        prisma.purchase.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true, design: true }
        })
    ])

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back, {session.user.email}</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Total Sales</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">₦{Number(totalSales._sum.amount || 0).toLocaleString()}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-green-500/10 to-transparent"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Users</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent"></div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Designs</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalDesigns}</p>
                        </div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-purple-500/10 to-transparent"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Shortcuts */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Link href="/admin/designs" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Manage Designs</h3>
                                    <p className="text-sm text-slate-500 mt-1">View, edit, or delete existing inventory</p>
                                </Link>

                                <Link href="/admin/upload" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors group">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Upload Design</h3>
                                    <p className="text-sm text-slate-500 mt-1">Add new architectural designs to the catalog</p>
                                </Link>

                                {session.user.email === 'frankensteingary777@gmail.com' && (
                                    <Link href="/admin/users" className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 transition-colors group">
                                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Manage Users</h3>
                                        <p className="text-sm text-slate-500 mt-1">Elevate or remove admin privileges</p>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Recent Sales</h2>
                            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                {recentSales.length > 0 ? (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                                            <tr>
                                                <th className="px-6 py-3 font-medium">Customer</th>
                                                <th className="px-6 py-3 font-medium">Item</th>
                                                <th className="px-6 py-3 font-medium text-right">Amount</th>
                                                <th className="px-6 py-3 font-medium text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {recentSales.map(sale => (
                                                <tr key={sale.id}>
                                                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{(sale.user as any).name || (sale.user as any).email}</td>
                                                    <td className="px-6 py-3 text-slate-500 truncate max-w-[200px]">{(sale.design as any).title}</td>
                                                    <td className="px-6 py-3 text-right font-mono">₦{Number(sale.amount).toLocaleString()}</td>
                                                    <td className="px-6 py-3 text-right text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-8 text-center text-slate-500">No sales yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="bg-indigo-900 rounded-xl p-6 text-white">
                            <h3 className="font-bold text-lg mb-2">Admin Tips</h3>
                            <ul className="space-y-2 text-indigo-100 text-sm list-disc pl-4">
                                <li>Ensure all designs have at least 4 preview images for best display.</li>
                                <li>Use the "Featured" flag to highlight top-tier designs on the homepage.</li>
                                <li>Check the Footprint Editor to ensure accurate site visualization.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
