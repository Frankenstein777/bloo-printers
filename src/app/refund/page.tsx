import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - Octoplans',
  description: 'Octoplans return and refund policy for digital architectural blueprints and services.',
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase italic">
            Refund Policy
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm tracking-widest uppercase">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none 
          prose-h2:font-mono prose-h2:text-[#00a3ad] dark:prose-h2:text-[#00f2ff] prose-h2:uppercase prose-h2:tracking-tighter prose-h2:text-2xl
          prose-strong:text-[#00a3ad] dark:prose-strong:text-[#00f2ff]
          prose-a:text-[#00f2ff] hover:prose-a:text-[#00a3ad] transition-colors">
          
          <p className="lead text-xl text-gray-700 dark:text-gray-300">
            Thank you for shopping at <strong>Octoplans</strong>. Because our products are digital assets (blueprints, CAD files, and immediate software services), our refund policy is designed to address the irreversible nature of digital delivery.
          </p>

          <h2>1. All Sales are Final</h2>
          <p>
            Due to the nature of digital products, <strong>all sales of digital architectural blueprints, 3D models, PDF files, DWG files, and related assets are final and non-refundable.</strong>
          </p>
          <p>
            Once a digital file has been accessed or the download link has been provided, we cannot process a refund. This policy is standard in the digital goods industry to prevent the "return" of files that have already been copied or stored locally.
          </p>

          <h2>2. Subscription & Credit Policy</h2>
          <p>
            For recurring Premium Subscriptions (including bundled GBS AI Studio Credits):
          </p>
          <ul>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Your premium benefits and credits will remain active until the end of your current billing cycle.</li>
            <li><strong>No Partial Refunds:</strong> We do not offer prorated refunds for canceled subscriptions. If you cancel mid-cycle, you will not receive a refund for the remaining days, but you will retain full access until the cycle expires.</li>
            <li><strong>Credit Expiration:</strong> Credits granted as part of a subscription do not roll over unless explicitly stated in your specific plan terms.</li>
          </ul>

          <h2>3. Technical Exceptions</h2>
          <p>
            While refunds are generally not granted, we are committed to delivery quality. We will issue a replacement or evaluate a refund under these specific circumstances:
          </p>
          <ul>
            <li><strong>Corrupted Files:</strong> If the downloaded file is corrupted or unreadable and our support team cannot provide a working replacement within 3 business days.</li>
            <li><strong>Non-Delivery:</strong> If a technical failure on our end prevents the digital download from becoming available within 48 hours of purchase.</li>
            <li><strong>Significant Misrepresentation:</strong> If the file content differs fundamentally from the advertised specifications (e.g., a completely different layout or missing critical pages as listed in the catalog).</li>
          </ul>

          <h2>4. Technical Support Process</h2>
          <p>
            If you encounter issues opening your purchased blueprints (common with incompatible CAD versions), please do not file a dispute immediately. Contact our support team for assistance:
          </p>
          <ol>
            <li>Email <strong>support@octoplans.com</strong> with your Order ID and a screenshot of the error.</li>
            <li>Our engineers will attempt to provide the file in an alternative format (e.g., converting a newer DWG to an older version).</li>
            <li>If technical resolution is impossible, we will initiate a refund via your original payment method (Stripe/Paystack).</li>
          </ol>

          <h2>5. Abuse of Policy</h2>
          <p>
            Octoplans monitors download activity logs. Any patterns of "purchase-and-dispute" or bulk downloads followed by refund requests will result in immediate account termination and permanent blacklisting from our marketplace.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            For refund requests related to technical failure, please reach out to:
            <br />
            <a href="mailto:billing@octoplans.com" className="font-mono font-bold">billing@octoplans.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

