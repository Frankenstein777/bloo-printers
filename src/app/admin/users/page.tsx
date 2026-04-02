import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { elevateToAdminAction, demoteFromAdminAction } from '@/app/actions'

const prisma = new PrismaClient()

export default async function AdminUsersPage() {
    const session = await getSession()
    if (!session || session.user.email !== 'frankensteingary777@gmail.com') {
        redirect('/admin') // Redirect standard admins or non-admins away
    }

    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/admin" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2 inline-block">&larr; Back to Dashboard</Link>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">Manage Users</h1>
                        <p className="text-slate-500 mt-1">Elevate users to Admin or remove their privileges.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {users.map(user => {
                                const isMainAdmin = user.email === 'frankensteingary777@gmail.com'
                                const isAdmin = user.role === 'ADMIN'

                                return (
                                    <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {user.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                {isMainAdmin ? 'MAIN ADMIN' : user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {!isMainAdmin && (
                                                <form action={isAdmin ? demoteFromAdminAction.bind(null, user.id) : elevateToAdminAction.bind(null, user.id)}>
                                                    <button type="submit" className={`text-sm font-medium ${isAdmin ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500' : 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-500'}`}>
                                                        {isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    )
}
