import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - Octoplans',
  description: 'Terms and conditions for using the Octoplans architectural platform.',
}

export default function TermsOfUse() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase italic">
            Terms of Use
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm tracking-widest uppercase">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none 
          prose-h2:font-mono prose-h2:text-[#00a3ad] dark:prose-h2:text-[#00f2ff] prose-h2:uppercase prose-h2:tracking-tighter prose-h2:text-2xl
          prose-strong:text-[#00a3ad] dark:prose-strong:text-[#00f2ff]
          prose-a:text-[#00f2ff] hover:prose-a:text-[#00a3ad] transition-colors">
          
          <p className="lead text-xl text-gray-700 dark:text-gray-300">
            Welcome to <strong>Octoplans</strong>. By accessing our website and using our digital architectural assets, you agree to be bound by the following terms and conditions. Please read them carefully before making any purchase.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By creating an account, purchasing a blueprint, or using our AI tools, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, you must immediately cease use of our platform.
          </p>

          <h2>2. Intellectual Property & Licensing</h2>
          <p>
            All content on Octoplans, including but not limited to architectural designs, 3D models, PDF blueprints, CAD files, and proprietary software, is the intellectual property of Octoplans or its licensors.
          </p>
          <ul>
            <li><strong>Single-Build License:</strong> Unless otherwise specified (e.g., via an Extended License), the purchase of a blueprint grants you a non-exclusive, non-transferable license to construct <strong>one (1) single structure</strong> based on the purchased plans.</li>
            <li><strong>Prohibited Uses:</strong> You may not resell, redistribute, or sub-license our designs. You may not claim the designs as your own production without written consent.</li>
            <li><strong>Derivative Works:</strong> Modifications made to the plans do not transfer ownership of the original base design to the user.</li>
          </ul>

          <h2>3. AI-Generated Content (GBS AI Studio)</h2>
          <p>
            Our platform features integrations with GBS AI Studio to generate architectural concepts and visualizations.
          </p>
          <ul>
            <li><strong>Conceptual Nature:</strong> AI-generated designs are strictly <strong>conceptual</strong> and do not constitute engineered architectural plans.</li>
            <li><strong>Ownership:</strong> Octoplans retains a royalty-free right to use AI-generated images created on the platform for gallery showcases and promotional purposes, unless your subscription plan specifies private generation.</li>
          </ul>

          <h2>4. Architectural & Engineering Disclaimer</h2>
          <p>
            <strong>Octoplans is a digital marketplace for conceptual designs. We are not a licensed architectural or engineering firm.</strong>
          </p>
          <ul>
            <li>The plans provided have not been reviewed for compliance with your specific local building codes, soil conditions, or environmental regulations.</li>
            <li><strong>Mandatory Review:</strong> You are legally required to have any blueprint purchased from Octoplans reviewed, modified, and stamped by a locally licensed professional (Architect or Structural Engineer) before applying for building permits or commencing construction.</li>
          </ul>

          <h2>5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Octoplans shall not be liable for any direct, indirect, incidental, or consequential damages arising from:
          </p>
          <ul>
            <li>Structural failures or construction defects in buildings constructed using our plans.</li>
            <li>Errors or omissions in the digital assets.</li>
            <li>Loss of data or business interruption resulting from the use of our platform.</li>
          </ul>

          <h2>6. Subscriptions & Billing</h2>
          <p>
            Premium Subscriptions are billed on a recurring basis. You may cancel at any time via your account settings. Bundled credits (e.g., GBS AI Studio credits) are subject to use-it-or-lose-it monthly resets unless specified otherwise in your plan.
          </p>

          <h2>7. Indemnification</h2>
          <p>
            You agree to indemnify and hold Octoplans harmless from any claims, losses, or legal fees resulting from your use of our blueprints in violation of local laws, your failure to obtain professional engineering stamps, or your breach of these Terms.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction where Octoplans is registered. Any disputes shall be resolved in the competent courts of said jurisdiction.
          </p>

          <h2>9. Contact</h2>
          <p>
            Questions regarding these terms should be directed to:
            <br />
            <a href="mailto:legal@octoplans.com" className="font-mono font-bold">legal@octoplans.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

