import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Disclaimer - Octoplans',
  description: 'Important legal limitations regarding architectural designs and professional liability.',
}

export default function LegalDisclaimer() {
  return (
    <div className="min-h-screen py-24 px-6 md:px-20 bg-white dark:bg-slate-950">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-4 border-b border-[#00f2ff]/20 pb-8 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase italic">
            Legal Disclaimer
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-mono text-sm tracking-widest uppercase">
            Notice to all Users and Clients
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none 
          prose-h2:font-mono prose-h2:text-[#00a3ad] dark:prose-h2:text-[#00f2ff] prose-h2:uppercase prose-h2:tracking-tighter prose-h2:text-2xl
          prose-strong:text-[#00a3ad] dark:prose-strong:text-[#00f2ff]
          prose-a:text-[#00f2ff] hover:prose-a:text-[#00a3ad] transition-colors">
          
          <p className="lead text-xl text-gray-700 dark:text-gray-300">
            The following disclaimer outlines the legal limitations of the digital architectural assets and AI-generated concepts provided by <strong>Octoplans</strong>.
          </p>

          <div className="p-6 border-l-4 border-[#00a3ad] bg-slate-50 dark:bg-slate-900/50 mb-8">
            <p className="font-bold text-[#00a3ad] dark:text-[#00f2ff] uppercase mb-2">Architectural Notice:</p>
            <p className="italic">
              Octoplans is a digital marketplace for conceptual design. We do not provide engineering, structural, or licensed architectural services. The blueprints provided are <strong>NOT</strong> "Final Construction Documents" as defined by local building authorities.
            </p>
          </div>

          <h2>1. Not a Substitute for Licensed Professionals</h2>
          <p>
            The blueprints and CAD files purchased from this platform represent conceptual architectural designs. They have not been reviewed for compliance with your specific local building codes, zoning laws, soil conditions, or climate-specific requirements.
          </p>
          <p>
            <strong>Requirement:</strong> You must engage a locally registered and licensed Architect and/or Structural Engineer to review, modify, and apply their professional stamp to these plans before they can be used for building permit applications or actual construction.
          </p>

          <h2>2. AI-Generated Concepts</h2>
          <p>
            Concepts generated via the GBS AI Studio integration are produced by algorithmic processes. These visualizations are for <strong>inspiration and conceptual planning only</strong>. They do not account for structural feasibility, load-bearing requirements, or life-safety regulations (e.g., fire exits, ADA compliance). Relying solely on AI visualizations for construction is strictly prohibited.
          </p>

          <h2>3. Limitation of Liability</h2>
          <p>
            Octoplans, its employees, and its contributing designers shall not be held liable for any:
          </p>
          <ul>
            <li>Structural failures, collapses, or safety hazards in structures built using these plans.</li>
            <li>Rejection of building permits by local authorities.</li>
            <li>Cost overruns or construction delays resulting from errors or omissions in the conceptual plans.</li>
            <li>Disputes with contractors or third-party builders.</li>
          </ul>

          <h2>4. Accuracy of Information</h2>
          <p>
            While we strive for precision, digital files may contain minor dimensional discrepancies. All measurements must be field-verified by your contractor before the commencement of work. Octoplans does not guarantee the accuracy of converted file formats (e.g., PDF to DWG conversions).
          </p>

          <h2>5. Regional Compliance</h2>
          <p>
            Building codes (such as IBC, IRC, Eurocodes, or local national codes) vary significantly by region. Octoplans designs are generic and do not inherently comply with any specific regional code unless explicitly stated in the product description. It is the user's sole responsibility to ensure all final construction documents meet local legal requirements.
          </p>

          <h2>6. Use at Your Own Risk</h2>
          <p>
            By downloading or using any asset from Octoplans, you explicitly agree that you are doing so at your own risk. You acknowledge that construction is a high-risk activity that requires professional oversight and local certification.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            If you have questions regarding the legal status of our designs, please contact:
            <br />
            <a href="mailto:compliance@octoplans.com" className="font-mono font-bold">compliance@octoplans.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}
