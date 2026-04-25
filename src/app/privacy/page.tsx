import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Octoplans',
  description: 'How Octoplans collects, uses, and protects your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase italic">
            Privacy Policy
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
            At <strong>Octoplans</strong>, your privacy is a foundational principle of our service. This policy outlines how we handle your personal data when you interact with our platform, purchase digital blueprints, or use our AI-powered architectural tools.
          </p>

          <h2>1. Data We Collect</h2>
          <p>
            We collect information strictly necessary to provide our services and ensure a secure transaction environment.
          </p>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and encrypted password.</li>
            <li><strong>Transaction Data:</strong> We maintain records of your purchases, including the specific blueprints downloaded and subscription status.</li>
            <li><strong>Payment Information:</strong> All payments are processed via <strong>Stripe</strong> or <strong>Paystack</strong>. Octoplans does not store your full credit card numbers or CVV on our servers. We only receive tokens and transaction confirmations from these providers.</li>
            <li><strong>AI Interaction Logs:</strong> When using the GBS AI Studio integration, we may store prompts and generated metadata to improve your user experience and for credit auditing.</li>
            <li><strong>Technical Data:</strong> IP addresses, browser types, and device identifiers are collected automatically for security monitoring and platform optimization.</li>
          </ul>

          <h2>2. Use of Information</h2>
          <p>Your data is used to:</p>
          <ul>
            <li>Fulfill orders and provide access to digital downloads.</li>
            <li>Manage your Premium Subscription and GBS AI Studio credits.</li>
            <li>Provide technical support and respond to inquiries.</li>
            <li>Send critical system notifications (e.g., password resets) and optional marketing communications.</li>
            <li>Protect against fraudulent transactions and unauthorized access.</li>
          </ul>

          <h2>3. Data Sharing and Third Parties</h2>
          <p>
            We do not sell your personal data. We only share information with third-party service providers necessary for our operations:
          </p>
          <ul>
            <li><strong>Payment Processors:</strong> Stripe and Paystack for secure billing.</li>
            <li><strong>Cloud Infrastructure:</strong> Vercel and AWS for hosting and data storage.</li>
            <li><strong>AI Services:</strong> GBS AI Studio for generating architectural concepts.</li>
            <li><strong>Email Services:</strong> For transaction receipts and newsletters.</li>
          </ul>

          <h2>4. Cookies and Tracking</h2>
          <p>
            Octoplans uses essential cookies for session management and security. We may also use analytical cookies to understand how users navigate our catalog. You can manage your cookie preferences through your browser settings, though disabling certain cookies may impact site functionality.
          </p>

          <h2>5. Your Rights (GDPR & CCPA)</h2>
          <p>
            Regardless of your location, Octoplans honors the core principles of data sovereignty:
          </p>
          <ul>
            <li><strong>Access & Portability:</strong> You may request a copy of the data we hold about you.</li>
            <li><strong>Rectification:</strong> You can update your account details at any time via your Profile dashboard.</li>
            <li><strong>Erasure (Right to be Forgotten):</strong> You may request the deletion of your account and associated personal data, subject to legal retention requirements for financial records.</li>
            <li><strong>Opt-out:</strong> You can unsubscribe from marketing emails via the link provided in each message.</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures, including SSL/TLS encryption for all data in transit and hashing for sensitive account information. While we strive to protect your data, no method of transmission over the internet is 100% secure.
          </p>

          <h2>7. International Transfers</h2>
          <p>
            As a global platform, your data may be processed in jurisdictions outside of your country of residence. We ensure that such transfers comply with applicable data protection laws.
          </p>

          <h2>8. Updates to this Policy</h2>
          <p>
            We may update this Privacy Policy to reflect changes in our practices or for legal reasons. Significant changes will be notified via email or a prominent notice on our platform.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            For any privacy-related inquiries or to exercise your data rights, please contact our Data Protection Officer at:
            <br />
            <a href="mailto:privacy@octoplans.com" className="font-mono font-bold">privacy@octoplans.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

