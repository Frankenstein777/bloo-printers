import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { submitArchitectApplicationAction } from '@/app/actions'

export default async function BecomeArchitectPage() {
    const session = await getSession()
    if (!session) redirect('/login?callbackUrl=/become-architect')

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) redirect('/')

    if (user.role === 'ARCHITECT' && user.architectStatus === 'APPROVED') {
        redirect('/architect/dashboard')
    }

    return (
        <div className="min-h-screen py-24 px-4 bg-slate-50 dark:bg-slate-950">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase mb-4">
                        Partner as an Architect
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-mono">
                        Join Octoplans to sell your architectural layouts directly to clients.
                    </p>
                </div>

                {user.architectStatus === 'PENDING' ? (
                    <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200 p-8 rounded-xl text-center space-y-4">
                        <svg className="mx-auto h-12 w-12 text-yellow-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold">Application Received</h2>
                        <p className="max-w-md mx-auto text-sm">
                            Your portfolio and application are currently under review by our curation team. This usually takes 24-48 hours.
                        </p>
                        <Link href="/" className="inline-block mt-4 text-[#00a3ad] font-bold hover:underline">
                            &larr; Return Home
                        </Link>
                    </div>
                ) : user.architectStatus === 'REJECTED' ? (
                    <div className="bg-red-50 border border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-600 dark:text-red-200 p-8 rounded-xl text-center space-y-4">
                        <svg className="mx-auto h-12 w-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-xl font-bold">Application Declined</h2>
                        <p className="max-w-md mx-auto text-sm">
                            Unfortunately, we are unable to accept your architect application at this time.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-lg">
                        <form action={submitArchitectApplicationAction} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">
                                    Portfolio Link
                                </label>
                                <input
                                    type="url"
                                    name="portfolioUrl"
                                    required
                                    placeholder="https://behance.net/yourprofile"
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]"
                                />
                                <p className="text-xs text-gray-500 mt-2">Provide a link to your online portfolio or drive folder containing your past architectural work.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-widest">
                                    Experience / Bio
                                </label>
                                <textarea
                                    name="experienceText"
                                    required
                                    rows={4}
                                    placeholder="Briefly describe your architectural background..."
                                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff]"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#00a3ad] hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all text-black font-bold font-mono py-4 rounded-lg uppercase tracking-widest"
                            >
                                Submit Application
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
