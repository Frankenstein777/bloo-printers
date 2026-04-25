import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ArchitectDashboardClient from '@/components/architect/ArchitectDashboardClient'

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
    <div className="min-h-screen py-12 px-4 bg-transparent transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Architect Dashboard</h1>

        {!hasPaid ? (
          <div className="p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Unlock Architect Portal</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 border border-indigo-100 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
              To start uploading designs to the <span className="font-bold">Octoplans Configurator</span>, an initial registration fee of ₦25,000 is required.
              <br/><br/>
              <span className="font-bold text-[#00a3ad] dark:text-[#00f2ff]">🎉 PROMO ALERT:</span> As an early adopter, this fee is strictly waived until <strong className="text-blue-500">July 1st, 2026</strong>!
            </p>
            <ArchitectDashboardClient email={session.user.email!} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow flex flex-col justify-center">
                <h3 className="text-sm uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Total Approved Earnings</h3>
                <p className="text-5xl font-black text-[#00a3ad] dark:text-[#00f2ff] mt-4 font-mono">
                  ₦{totalEarnings.toLocaleString()}
                </p>
                <p className="text-xs font-mono text-gray-400 mt-2">octoplans platform fee (15%) deducted</p>
              </div>
              <div className="p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow flex flex-col justify-center items-center text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
                  Ready to add a new design to the catalog?
                </p>
                <Link href="/architect/upload" className="bg-[#00a3ad] hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all text-black font-bold py-3 px-8 rounded-md uppercase tracking-widest text-sm inline-flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Upload New Design
                </Link>
              </div>
            </div>

            <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Active Designs</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Design Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Sales Count</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {designs.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                         <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">{d.title}</td>
                         <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 font-mono">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                             {d.purchases.length} Sales
                           </span>
                         </td>
                         <td className="px-6 py-5 whitespace-nowrap text-right text-sm">
                           <Link href={`/designs/${d.id}`} className="text-[#00a3ad] dark:text-[#00f2ff] hover:underline font-medium">View Portfolio &rarr;</Link>
                         </td>
                      </tr>
                    ))}
                    {designs.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                          <span className="block font-medium text-gray-900 dark:text-white mb-1">No designs yet</span>
                          <span className="block text-gray-500">Get started by uploading your first blueprint.</span>
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
