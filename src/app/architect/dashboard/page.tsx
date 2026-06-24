import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ArchitectDashboardClient from '@/components/architect/ArchitectDashboardClient'
import PayoutFlowClient from '@/components/architect/PayoutFlowClient'

export default async function ArchitectDashboardPage({ searchParams }: { searchParams: { verify_fee?: string } }) {
  const session = await getSession()
  if (!session || session.user.role !== 'ARCHITECT') {
    redirect('/login')
  }

  const { verify_fee } = await searchParams

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user) redirect('/login')

  if (verify_fee) {
    const { verifyArchitectFeeAction } = await import('@/app/actions')
    await verifyArchitectFeeAction(verify_fee)
  }

  const userPostVerify = await prisma.user.findUnique({ where: { id: session.user.id } })
  const hasPaid = userPostVerify?.hasPaidArchitectFee || false

  // Fetch their designs and compute earnings
  const designs = await prisma.design.findMany({
    where: { authorId: session.user.id },
    include: { purchases: true }
  })

  let totalEarnings = 0
  designs.forEach(d => {
    d.purchases.forEach(p => {
      totalEarnings += Number(p.amount) * 0.85
    })
  })

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-transparent transition-colors font-sans">
      <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto space-y-8">
        
        {/* Header Block (Midnight Navy bg) */}
        <div className="bg-brand-navy text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Architect Partner Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Manage blueprint catalog portfolio uploads and approved earnings.</p>
          </div>
          {hasPaid && (
            <Link href="/architect/upload" className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold py-2.5 px-6 rounded-lg text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Upload Design
            </Link>
          )}
        </div>

        {!hasPaid ? (
          <div className="p-8 bg-card rounded-2xl border border-border shadow-sm max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold text-brand-charcoal dark:text-white">Unlock Architect Portal</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm border border-brand-teal/20 bg-brand-teal/5 p-4 rounded-xl leading-relaxed">
              To start uploading designs to the <span className="font-bold">Octoplans Configurator</span>, an initial registration fee of ₦25,000 is required.
              <br/><br/>
              <span className="font-bold text-brand-teal">🎉 PROMO ALERT:</span> As an early adopter, this fee is strictly waived until <strong className="text-brand-teal font-extrabold">July 1st, 2026</strong>!
            </p>
            <ArchitectDashboardClient email={session.user.email!} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Earnings (Revenue Green) */}
              <div className="p-8 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-center">
                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">Total Approved Earnings</h3>
                <p className="text-5xl font-black text-brand-success mt-4 font-mono">
                  ₦{totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">octoplans platform fee (15%) deducted</p>
              </div>

              {/* Upload CTA block */}
              <div className="p-8 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-center items-center text-center">
                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                  Ready to add a new design to the catalog?
                </p>
                <Link href="/architect/upload" className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold py-3 px-8 rounded-lg text-sm inline-flex items-center gap-2 shadow-sm transition-all cursor-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Upload New Design
                </Link>
              </div>
            </div>

            {/* Payout forms */}
            <div className="mt-8">
               <PayoutFlowClient 
                 defaultBankName={userPostVerify?.bankName || ''}
                 defaultAccountName={userPostVerify?.accountName || ''}
                 defaultAccountNumber={userPostVerify?.accountNumber || ''}
                 hasRequested={!!userPostVerify?.payoutRequestedAt}
                 totalEarnings={totalEarnings}
               />
            </div>

            {/* Portfolio listing */}
            <div className="mt-12 bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-border bg-slate-50 dark:bg-slate-900/50">
                <h2 className="text-lg font-bold text-brand-charcoal dark:text-white">My Active Designs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Design Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sales Count</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {designs.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/25 transition-colors">
                         <td className="px-6 py-5 whitespace-nowrap text-sm text-brand-charcoal dark:text-white font-semibold">{d.title}</td>
                         <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 font-mono">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-teal/10 text-brand-teal">
                             {d.purchases.length} Sales
                           </span>
                         </td>
                         <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                           <Link href={`/designs/${d.id}`} className="text-brand-teal hover:underline font-semibold cursor-none">View Portfolio &rarr;</Link>
                         </td>
                      </tr>
                    ))}
                    {designs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-sm text-slate-400">
                          <svg className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                          <span className="block font-semibold text-brand-charcoal dark:text-white mb-1">No designs uploaded yet</span>
                          <span className="block text-slate-500 dark:text-slate-400">Get started by uploading your first blueprint.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
