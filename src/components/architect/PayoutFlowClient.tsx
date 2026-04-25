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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow space-y-6">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payout Settings</h2>
      
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
          <input required type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name</label>
          <input required type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
          <input required type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white" />
        </div>
        <button disabled={loading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
          Save Settings
        </button>
      </form>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-lg mb-2">Request Payout</h3>
        {requested ? (
          <p className="text-sm font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded">
            ✓ Payout request submitted. It will be processed within 24 hours.
          </p>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Request a payout for your cleared earnings of <strong>₦{totalEarnings.toLocaleString()}</strong>.
            </p>
            <button 
              disabled={loading || totalEarnings === 0 || !bankName || !accountNumber} 
              onClick={handleRequestPayout}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm disabled:opacity-50 transition-colors"
            >
              Request Payout
            </button>
            {(totalEarnings === 0 || !bankName || !accountNumber) && (
              <p className="text-xs text-red-500 mt-2">
                Make sure you have earnings and have saved your payout settings above.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
