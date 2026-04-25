import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { resolveArchitectApplicationAction } from '@/app/actions'

export default async function ArchitectApplicationsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const pendingApps = await prisma.user.findMany({
    where: { architectStatus: 'PENDING' },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Pending Architect Applications</h1>
      
      {pendingApps.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl text-center text-slate-500">
          No pending applications. You're all caught up!
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApps.map(app => (
            <div key={app.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{app.name || 'Unnamed User'}</h2>
                  <p className="text-slate-500 text-sm">{app.email}</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Portfolio Link</p>
                  <a href={app.portfolioUrl!} target="_blank" rel="noopener noreferrer" className="text-[#00a3ad] dark:text-[#00f2ff] hover:underline font-mono text-sm break-all">
                    {app.portfolioUrl}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 mb-1">Experience</p>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {app.experienceText}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 min-w-[140px] justify-center">
                <form action={resolveArchitectApplicationAction}>
                  <input type="hidden" name="userId" value={app.id} />
                  <input type="hidden" name="status" value="APPROVED" />
                  <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow uppercase tracking-widest text-sm transition-colors">
                    Approve
                  </button>
                </form>
                <form action={resolveArchitectApplicationAction}>
                  <input type="hidden" name="userId" value={app.id} />
                  <input type="hidden" name="status" value="REJECTED" />
                  <button type="submit" className="w-full border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold py-3 rounded-lg uppercase tracking-widest text-sm transition-colors">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
