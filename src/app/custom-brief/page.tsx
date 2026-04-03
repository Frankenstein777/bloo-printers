export default function CustomBriefPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-gray-900 dark:text-white">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase">
                        Custom Design Brief
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 font-mono">
                        Tell us exactly what you need. Our expert architects will craft a custom design tailored to your vision.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Full Name</label>
                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Email Address</label>
                                <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Project Type</label>
                            <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]">
                                <option>Residential (Duplex, Bungalow, etc)</option>
                                <option>Commercial (Plaza, Office Building)</option>
                                <option>Industrial (Warehouse, Factory)</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Preferred Plot Size</label>
                            <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" placeholder="e.g. 50ft x 100ft" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Detailed Description</label>
                            <textarea rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff] resize-none" placeholder="Please describe the number of bedrooms, specific features (penthouse, swimming pool), and any distinct architectural style you want..."></textarea>
                        </div>

                        <button type="button" className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-black py-4 rounded-lg text-lg uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all">
                            Submit Request
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-500 mt-4">* We will get back to you within 24-48 hours with a quote.</p>
                </div>
            </div>
        </div>
    )
}
