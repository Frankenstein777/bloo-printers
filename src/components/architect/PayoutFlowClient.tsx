'use client'

import { useState } from 'react'
import { updatePayoutSettingsAction, requestPayoutAction } from '@/app/actions'

export default function PayoutFlowClient({ defaultBankName, defaultAccountName, defaultAccountNumber, hasRequested, totalEarnings }: { defaultBankName: string, defaultAccountName: string, defaultAccountNumber: string, hasRequested: boolean, totalEarnings: number }) {
  const [bankName, setBankName] = useState(defaultBankName)
  const [accountName, setAccountName] = useState(defaultAccountName)
  const [accountNumber, setAccountNumber] = useState(defaultAccountNumber)
  const [loading, setLoading] = useState(false)
  const [requested, setRequested] = useState(hasRequested)

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await updatePayoutSettingsAction({ bankName, accountName, accountNumber })
    if (res.success) {
      alert('Payout settings saved successfully!')
    } else {
      alert('Failed: ' + res.error)
    }
    setLoading(false)
  }

  const handleRequestPayout = async () => {
    setLoading(true)
    const res = await requestPayoutAction()
    if (res.success) {
      alert('Payout requested successfully! Payout will be processed within 24 hours.')
      setRequested(true)
    } else {
      alert('Failed: ' + res.error)
    }
    setLoading(false)
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-6 font-sans">
      <h2 className="text-xl font-bold text-brand-charcoal dark:text-white">Payout Settings</h2>
      
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-1 uppercase tracking-wider">Bank Name</label>
            <input required type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-teal outline-none rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 cursor-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-1 uppercase tracking-wider">Account Name</label>
            <input required type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-teal outline-none rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 cursor-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-450 mb-1 uppercase tracking-wider">Account Number</label>
            <input required type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-brand-teal outline-none rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 cursor-none" />
          </div>
        </div>
        <button disabled={loading} type="submit" className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider transition-all shadow-sm cursor-none">
          Save Settings
        </button>
      </form>

      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-lg mb-2 text-brand-charcoal dark:text-white">Request Payout</h3>
        {requested ? (
          <p className="text-sm font-semibold text-brand-warning bg-brand-warning/10 border border-brand-warning/30 p-3 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Payout request is pending review. It will be processed within 24 hours.
          </p>
        ) : (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Request a payout for your cleared earnings of <strong className="text-brand-success font-extrabold">₦{totalEarnings.toLocaleString()}</strong>.
            </p>
            <button 
              disabled={loading || totalEarnings === 0 || !bankName || !accountNumber} 
              onClick={handleRequestPayout}
              className="bg-brand-success hover:bg-brand-success/90 text-white font-bold py-2.5 px-6 rounded-lg text-xs uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm cursor-none"
            >
              Request Payout
            </button>
            {(totalEarnings === 0 || !bankName || !accountNumber) && (
              <p className="text-xs text-brand-error mt-2 font-medium">
                Make sure you have earnings and have saved your payout settings above.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
