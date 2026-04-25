import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function AdminPayoutsPage() {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  // Find users who are ARCHITECTs and have sales
  const architects = await prisma.user.findMany({
    where: { role: 'ARCHITECT' },
    include: {
      designs: {
        include: { purchases: true }
      }
    }
  })

  // Aggregate stats via map
  const payoutStats = architects.map(arch => {
    let rawTotal = 0
    let architectShare = 0
    let octoplansShare = 0
    let salesCount = 0

    arch.designs.forEach(d => {
      d.purchases.forEach(p => {
        const amt = Number(p.amount)
        rawTotal += amt
        architectShare += amt * 0.85
        octoplansShare += amt * 0.15
        salesCount++
      })
    })

    return {
      archName: arch.name || arch.email,
      rawTotal,
      architectShare,
      octoplansShare,
      salesCount,
      payoutRequestedAt: arch.payoutRequestedAt,
      bankName: arch.bankName,
      accountName: arch.accountName,
      accountNumber: arch.accountNumber
    }
  })

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Architect Payouts & Sales Ledger</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900/80">
            <tr>
              <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-widest">Architect</th>
              <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-widest">Items Sold</th>
              <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-widest">Gross Total</th>
              <th className="px-6 py-4 text-left text-xs text-green-600 dark:text-green-400 uppercase font-bold tracking-widest">Octoplans 15%</th>
              <th className="px-6 py-4 text-left text-xs text-blue-600 dark:text-blue-400 uppercase font-bold tracking-widest">Architect 85%</th>
              <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-widest">Payout Info</th>
              <th className="px-6 py-4 text-left text-xs text-gray-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {payoutStats.map((stat, i) => (
              <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${stat.payoutRequestedAt && stat.architectShare > 0 ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''}`}>
                <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{stat.archName}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-mono">{stat.salesCount}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500 font-mono">₦{stat.rawTotal.toLocaleString()}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-green-600 font-black font-mono">₦{stat.octoplansShare.toLocaleString()}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-blue-600 font-black font-mono">₦{stat.architectShare.toLocaleString()}</td>
                <td className="px-6 py-5 whitespace-nowrap text-xs text-gray-500">
                   {stat.bankName ? (
                     <>
                       <strong>{stat.bankName}</strong><br/>
                       {stat.accountName}<br/>
                       {stat.accountNumber}
                     </>
                   ) : 'No info provided'}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-500">
                   {stat.payoutRequestedAt && stat.architectShare > 0 ? (
                      <span className="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 rounded font-bold text-xs uppercase">
                        Requested on {new Date(stat.payoutRequestedAt).toLocaleDateString()}
                      </span>
                   ) : '—'}
                </td>
              </tr>
            ))}
            {payoutStats.length === 0 && (
               <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-gray-500 border-t border-gray-200 dark:border-gray-700">No architect sales yet. Ledger is clean.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
