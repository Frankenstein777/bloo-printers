import PaystackSubscribeButton from '@/components/PaystackSubscribeButton'
import { getSession } from '@/lib/auth'

export default async function SubscribePage() {
    const session = await getSession()
    
    // Check if user is already premium
    const isPremium = (session?.user as any)?.subscriptionStatus === 'PREMIUM' || (session?.user as any)?.role === 'ADMIN'

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-gray-900 dark:text-white">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase">
                        Premium Subscription
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-lg max-w-2xl mx-auto">
                        Elevate your architectural workflow with our Premium Subscription. Unlock powerful tools, endless designs, and deep discounts.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-start">
                    
                    {/* FREE TIER */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-sm">
                        <h2 className="text-2xl font-black font-mono text-gray-800 dark:text-gray-200 uppercase mb-2">Free Starter</h2>
                        <div className="text-3xl font-black font-mono mb-8 opacity-50">₦0 / year</div>
                        
                        <ul className="space-y-4 font-mono text-sm text-gray-600 dark:text-gray-400 mb-8">
                            <li className="flex gap-3">
                                <span className="text-green-500">✓</span> Access to Free Catalog Designs
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-500">✓</span> Basic 3D Viewing
                            </li>
                            <li className="flex gap-3 opacity-50">
                                <span className="text-gray-500">✕</span> No Discounts on Purchases
                            </li>
                            <li className="flex gap-3 opacity-50">
                                <span className="text-gray-500">✕</span> No GBS AI Studio Credits
                            </li>
                            <li className="flex gap-3 opacity-50">
                                <span className="text-gray-500">✕</span> Source CAD Files Cost Extra
                            </li>
                            <li className="flex gap-3 opacity-50">
                                <span className="text-gray-500">✕</span> Floor Plans Are Blurred
                            </li>
                        </ul>
                    </div>

                    {/* PREMIUM TIER */}
                    <div className="bg-black border-2 border-[#00f2ff] p-8 rounded-2xl shadow-[0_0_30px_rgba(0,242,255,0.2)] relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f2ff] blur-[100px] opacity-30 rounded-full" />
                        
                        <div className="bg-[#00f2ff] text-black text-xs font-black uppercase tracking-widest px-3 py-1 inline-block rounded mb-4">Recommended</div>
                        <h2 className="text-2xl font-black font-mono text-white uppercase mb-2">Premium Member</h2>
                        <div className="text-3xl font-black font-mono text-[#00f2ff] mb-2">₦80,000 <span className="text-lg opacity-60">/ month</span></div>
                        <div className="text-sm font-mono text-[#00f2ff]/50 mb-8">or ₦800,000 <span className="opacity-70">/ year</span> — save ₦160,000</div>
                        
                        <ul className="space-y-4 font-mono text-sm text-gray-300 mb-8 max-w-md relative z-10">
                            <li className="flex gap-3">
                                <span className="text-[#00f2ff]">✓</span> 
                                <div>
                                    <strong className="text-white">15% Automatic Discount</strong><br/>
                                    Applies to all purchases, stacking with global discounts automatically.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00f2ff]">✓</span> 
                                <div>
                                    <strong className="text-white">Free CAD Source Files</strong><br/>
                                    Get the .DWG / .RVT files free whenever you purchase a Complete PDF package.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00f2ff]">✓</span> 
                                <div>
                                    <strong className="text-white">500 GBS AI Studio Credits</strong><br/>
                                    Instantly generated credits for our partner AI rendering & concept generation suite.
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[#00f2ff]">✓</span> 
                                <div>
                                    <strong className="text-white">Detailed Architectural Floor Plans</strong><br/>
                                    View high-resolution, unblurred layout plans for all designs to help inform your planning.
                                </div>
                            </li>
                        </ul>

                        <div className="relative z-10 mt-10">
                            {isPremium ? (
                                <div className="w-full bg-[#00f2ff]/20 border border-[#00f2ff] text-[#00f2ff] font-bold py-4 px-8 rounded-md text-center uppercase tracking-widest">
                                    You are Premium
                                </div>
                            ) : (
                                <div className="p-4 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-lg">
                                    <p className="text-xs text-[#00f2ff] font-mono mb-4 text-center">Clicking subscribe will secure your transaction securely via Paystack.</p>
                                    <PaystackSubscribeButton email={session?.user?.email || 'guest@example.com'} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
