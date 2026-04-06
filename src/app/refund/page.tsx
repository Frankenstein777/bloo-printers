import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy - Octoplans',
  description: 'Octoplans return and refund policy for digital architectural blueprints and services.',
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8">
          <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase">
            Refund Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-h2:font-mono prose-h2:text-[#00a3ad] dark:prose-h2:text-[#00f2ff] prose-h2:uppercase">
          <p>
            Thank you for shopping at <strong>Octoplans</strong>. Because our products are digital blueprints, CAD files, and immediate software services, our refund policy reflects the irreversible nature of digital goods delivery.
          </p>

          <h2>1. Digital Products and Blueprints</h2>
          <p>
            Due to the nature of digital products, <strong>all sales of digital architectural blueprints, 3D models, PDF files, DWG files, and related assets are final and non-refundable.</strong>
          </p>
          <p>
            Once a digital product has been purchased and the download link has been provided or the file has been accessed, we cannot process a refund. This rule protects the intellectual property of our architects and ensures that the digital files cannot be "returned" while still retaining a local copy.
          </p>

          <h2>2. Premium Subscription and Credits</h2>
          <p>
            For recurring Premium Subscriptions (including the automatic disbursement of GBS AI Studio Credits):
          </p>
          <ul>
            <li><strong>Cancellation:</strong> You may cancel your subscription at any time. Your premium benefits and credits will remain active until the end of your current billing cycle.</li>
            <li><strong>No Partial Refunds:</strong> We do not offer prorated refunds for canceled subscriptions. If you cancel half-way through the month, you will not be refunded for the remainder of the month, but you will retain access for that duration.</li>
          </ul>

          <h2>3. Exceptions and Technical Issues</h2>
          <p>
            We stand by the quality of our files. While refunds are generally not granted, we will issue a replacement or evaluate a refund under the following exceptional circumstances:
          </p>
          <ul>
            <li><strong>Corrupted Files:</strong> If the file you downloaded is corrupted, unreadable, or missing critical layers that were advertised, you must contact us within 7 days of purchase. We will first attempt to provide a fixed replacement file. If we cannot resolve the corruption within 3 business days, a full refund will be issued.</li>
            <li><strong>Major Defects:</strong> If the blueprint vastly misrepresents the advertised layout (e.g., you purchased a 4-bedroom plan, but the file only contains 2 bedrooms).</li>
            <li><strong>Non-Delivery:</strong> If a technical issue on our end prevents the digital download from becoming available, and our support team cannot manually deliver the file to you within 48 hours of your request.</li>
          </ul>

          <h2>4. Requesting Technical Support</h2>
          <p>
            If you encounter any issues downloading, extracting, or opening your purchased blueprints, please do not file a chargeback immediately. This is often a simple software compatibility issue. 
          </p>
          <p>
            Contact our technical support at <strong>support@octoplans.com</strong> or via our WhatsApp channel with your Order ID, and we will assist you in accessing your purchased materials.
          </p>

          <h2>5. Policy Changes</h2>
          <p>
            We reserve the right to modify this refund policy at any time. Modifications will be effective immediately upon publication on this website. Your continued use of our services constitutes your acceptance of these Terms.
          </p>
        </div>
      </div>
    </div>
  )
}
