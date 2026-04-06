import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Octoplans',
  description: 'How Octoplans collects, uses, and protects your data.',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8">
          <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase">
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-h2:font-mono prose-h2:text-[#00a3ad] dark:prose-h2:text-[#00f2ff] prose-h2:uppercase">
          <p>
            At <strong>Octoplans</strong>, accessible from octoplans.com, one of our main priorities is the privacy of our visitors and clients. This Privacy Policy document contains types of information that is collected and recorded by Octoplans and how we use it.
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey, or fill out a form. The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
          </p>
          <ul>
            <li><strong>Personal Identification Information:</strong> Name, email address, phone number, etc.</li>
            <li><strong>Account Data:</strong> Passwords, preferences, and purchase history.</li>
            <li><strong>Payment Information:</strong> Processed securely via our third-party payment providers (Stripe, Paystack). We do not store full credit card details.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul>
            <li>Provide, operate, and maintain our website and services.</li>
            <li>Improve, personalize, and expand our platform.</li>
            <li>Understand and analyze how you use our blueprints and AI tools.</li>
            <li>Process your transactions and send related information, including purchase confirmations and invoices.</li>
            <li>Send you emails relating to your account, updates, and promotional content (which you can opt out of at any time).</li>
            <li>Find and prevent fraud.</li>
          </ul>

          <h2>3. Cookies and Web Beacons</h2>
          <p>
            Like any other website, Octoplans uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h2>4. Third-Party Privacy Policies</h2>
          <p>
            Octoplans's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers or payment processors for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
          </p>

          <h2>5. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
          <p>
            Under the CCPA, among other rights, California consumers have the right to:
          </p>
          <ul>
            <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
            <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
            <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
          </ul>
          <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

          <h2>6. GDPR Data Protection Rights</h2>
          <p>
            We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
          </p>
          <ul>
            <li><strong>The right to access</strong> – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
            <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate or incomplete.</li>
            <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
            <li><strong>The right to restrict processing</strong> – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
            <li><strong>The right to object to processing</strong> – You have the right to object to our processing of your personal data, under certain conditions.</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at support@octoplans.com.
          </p>
        </div>
      </div>
    </div>
  )
}
