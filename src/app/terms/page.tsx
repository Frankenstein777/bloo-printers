import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Use - Octoplans',
  description: 'Terms and conditions for using the Octoplans architectural platform.',
}

export default function TermsOfUse() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8">
          <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase">
            Terms of Use
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-h2:font-mono prose-h2:text-[#00a3ad] dark:prose-h2:text-[#00f2ff] prose-h2:uppercase">
          <p>
            Welcome to <strong>Octoplans</strong>! These terms and conditions outline the rules and regulations for the use of Octoplans's Website and Digital Assets, located at octoplans.com.
          </p>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use Octoplans if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h2>1. Terminology</h2>
          <p>
            The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company’s terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.
          </p>

          <h2>2. License and Intellectual Property Right</h2>
          <p>
            Unless otherwise stated, Octoplans and/or its licensors own the intellectual property rights for all material on Octoplans, including architectural designs, 3D models, PDF blueprints, and proprietary scripts. All intellectual property rights are reserved. You may access this from Octoplans for your own personal or commercial use subject to restrictions set in these terms and conditions.
          </p>
          <p>You must not:</p>
          <ul>
            <li>Republish material from Octoplans without prior written consent or an extended commercial license.</li>
            <li>Sell, rent or sub-license material from Octoplans.</li>
            <li>Reproduce, duplicate or copy material from Octoplans.</li>
            <li>Redistribute content from Octoplans (unless content is specifically made for redistribution).</li>
          </ul>

          <h2>3. Blueprint Usage & Liability</h2>
          <p>
            The digital architectural blueprints provided by Octoplans are meant for conceptual, planning, and schematic design purposes. <strong>Octoplans is not a substitute for a licensed local architect, structural engineer, or contractor.</strong>
          </p>
          <ul>
            <li>You agree that, before commencing any construction, you will have the provided blueprints reviewed, modified, and stamped by a locally registered and licensed architectural/engineering professional to ensure compliance with local building codes, weather conditions, and site-specific topography.</li>
            <li>Octoplans shall not be held liable for any structural failures, construction issues, or legal disputes arising from the direct use of these conceptual plans without proper local professional endorsement.</li>
          </ul>

          <h2>4. User Accounts and Security</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2>5. Subscription and Credits</h2>
          <p>
            If you subscribe to the Octoplans Premium Plan, you will be billed on a recurring basis. Premium perks, such as bundled credits for the GBS AI Studio, are granted automatically per billing cycle and are subject to expiration rules as detailed on the billing invoice. Octoplans reserves the right to modify subscription pricing with a 30-day notice to active users.
          </p>

          <h2>6. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which Octoplans operates, without regard to its conflict of law provisions.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@octoplans.com.
          </p>
        </div>
      </div>
    </div>
  )
}
