'use client'
import { useState } from 'react'
import { initializeArchitectFeeAction } from '@/app/actions'

export default function ArchitectDashboardClient({ email }: { email: string }) {
  const [loading, setLoading] = useState(false)

  const handlePayFee = async () => {
    setLoading(true)
    const res = await initializeArchitectFeeAction(email)
    if (res.success) {
      if (res.bypassed) {
        window.location.reload()
      } else if (res.url) {
        window.location.href = res.url
      }
    } else {
      alert('Failed: ' + res.error)
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handlePayFee} 
      disabled={loading}
      className="bg-[#00a3ad] hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all text-black font-bold py-3 px-6 rounded-md disabled:opacity-50 inline-flex items-center gap-2"
    >
      {loading ? 'Processing...' : 'Pay Registration Fee (waived until July 2026)'}
    </button>
  )
}
