'use client'

import { useState } from 'react'

const testimonials = [
  { u: "Architect X", c: "The precision is unmatched. Downloaded a villa plan and printed it directly to the site." },
  { u: "Builder 88", c: "Zero latency. Instant delivery. The future of construction is here." },
  { u: "Design Core", c: "Aesthetic and functional. Octoplans is the only resource we trust." },
  { u: "Tunde O.", c: "Omo, the structural details are so clear. My bricklayers didn't even ask questions." },
  { u: "Ngozi A.", c: "I was skeptical about buying blueprints online but Octoplans proved me wrong. Beautiful designs!" },
  { u: "Femi Built It", c: "I use their 3D renderings to convince my clients. The ROI is just crazy." },
  { u: "Emeka Structures", c: "Very standard drawings. The plumbing and electrical sheets saved me weeks of stress." },
  { u: "Aisha R.", c: "Sleek, modern, and exactly what we needed for our Abuja project. Highly recommended!" },
  { u: "Chinedu V.", c: "The plot sizing tool helped me know exactly what fits on my 50x100 land. Perfect." },
  { u: "Alhaji Musa", c: "Good standard for Nigerian weather. The ventilation on their duplex designs makes sense." },
  { u: "Lagos Developer", c: "Affordable and fast. We’ve stopped doing from-scratch designs for simple terrace houses." },
  { u: "Kehinde D.", c: "The subscriber discount is so lit!! I bought 3 designs immediately." },
  { u: "Dr. Biyi", c: "I loved how easy it was to request a custom change. They edited the roof in a day." },
  { u: "Ijeoma J.", c: "Honestly, the free AutoCAD files saved me a lot. Now my engineer is happy." },
  { u: "Adeyemi C.", c: "I’ve tried other platforms, but Octoplans interface is just smooth and fast." },
  { u: "Civil Segun", c: "The structural sheets are very solid. Tested and trusted on two sites now." },
  { u: "Rita C.", c: "I just wanted a simple bungalow for my village. Got exactly what I wanted under 10 minutes." },
  { u: "Engr. Yusuf", c: "The PDF renders are so high-resolution, they look like real pictures." },
  { u: "Kemi Homes", c: "Great platform for real estate devs. Keeps our portfolio full of modern concepts." },
  { u: "Victor O.", c: "Downloaded the DWG and modified it easily. Great starting point for my firm." }
]

export function TestimonialList() {
    const [expanded, setExpanded] = useState(false)
    const visibleCount = expanded ? testimonials.length : 6
    const displayed = testimonials.slice(0, visibleCount)

    return (
        <div>
            <div className="grid md:grid-cols-3 gap-8 mb-10">
                {displayed.map((t, i) => (
                    <div key={i} className="p-6 border border-gray-200 dark:border-gray-800 bg-white/5 backdrop-blur-sm hover:border-[#00f2ff] transition-colors group text-gray-100">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-[#00f2ff]/20 rounded-none flex items-center justify-center text-[#00f2ff]">
                                {t.u[0]}
                            </div>
                            <div>
                                <p className="font-mono font-bold text-sm tracking-widest uppercase text-white">{t.u}</p>
                                <p className="text-xs opacity-50 font-mono uppercase">Verified</p>
                            </div>
                        </div>
                        <p className="italic opacity-80 text-gray-200">&quot;{t.c}&quot;</p>
                    </div>
                ))}
            </div>
            
            {testimonials.length > 6 && (
                 <div className="flex justify-center">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="px-8 py-3 text-sm font-bold font-mono tracking-widest text-white border border-[#00f2ff] hover:bg-[#00f2ff] hover:text-black transition-all hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] uppercase"
                    >
                        {expanded ? 'Show Less' : 'Load More Reviews'}
                    </button>
                 </div>
            )}
        </div>
    )
}
