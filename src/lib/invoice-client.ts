import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface InvoiceData {
    id: string
    date: Date
    user: {
        email: string
        name?: string
    }
    items: {
        description: string
        quantity: number
        price: number
    }[]
    total: number
    currency: string
    reference: string
}

// Helper to load font as Base64
async function loadFontToBase64(url: string): Promise<string> {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const result = reader.result as string
            // Remove data:font/*;base64, prefix
            const base64 = result.split(',')[1]
            resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

// Helper to load any image as a data URL (for jsPDF addImage)
async function loadImageDataUrl(url: string): Promise<string> {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

export async function generateInvoice(data: InvoiceData) {
    const doc = new jsPDF()

    // Load Custom Signature Font
    try {
        const fontBase64 = await loadFontToBase64('/fonts/Wistania.ttf')
        doc.addFileToVFS('Wistania.ttf', fontBase64)
        doc.addFont('Wistania.ttf', 'Wistania', 'normal')
    } catch (e) {
        console.error("Could not load custom font, falling back to Courier", e)
    }

    // Logo image in header
    try {
        const logoDataUrl = await loadImageDataUrl('/logo.png')
        // Place octopus logo top-left: 12mm wide, proportional height (~12.6mm for 526×550 ratio)
        doc.addImage(logoDataUrl, 'PNG', 20, 8, 12, 12.6)
    } catch (e) {
        console.warn('Could not load logo for invoice', e)
    }

    // Brand name & address (offset right of logo)
    doc.setFontSize(22)
    doc.setTextColor(0, 242, 255) // Cyan #00f2ff
    doc.text('OCTOPLANS', 35, 16)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text('Advanced Architectural Systems', 35, 22)
    doc.text('Lagos, Nigeria', 35, 27)

    // Invoice Info
    doc.setFontSize(16)
    doc.setTextColor(0)
    doc.text('INVOICE', 140, 20)

    doc.setFontSize(10)
    doc.text(`Ref: ${data.reference}`, 140, 28)
    doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, 140, 33)

    // Buyer Details
    if (data.user.name) {
        doc.text(`Bill To: ${data.user.name}`, 140, 38)
        doc.text(data.user.email, 140, 43)
    } else {
        doc.text(`Bill To: ${data.user.email}`, 140, 38)
    }

    // Table
    autoTable(doc, {
        startY: 50,
        head: [['Description', 'Qty', 'Unit Price', 'Amount']],
        body: data.items.map(item => [
            item.description,
            item.quantity,
            `${data.currency} ${item.price.toFixed(2)}`,
            `${data.currency} ${(item.price * item.quantity).toFixed(2)}`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 163, 173], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
    })

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.text(`Unpaid Balance: ${data.currency} 0.00`, 140, finalY)
    doc.setFontSize(14)
    doc.setTextColor(0, 163, 173)
    doc.text(`TOTAL PAID: ${data.currency || 'NGN'} ${data.total.toLocaleString()}`, 140, finalY + 8)

    // Signature
    try {
        doc.setFont("Wistania", "normal") // Try custom font
        doc.setFontSize(24) // Signatures are usually larger
    } catch {
        doc.setFont("courier", "italic") // Fallback
        doc.setFontSize(14)
    }

    doc.setTextColor(0)
    doc.text("Octoplans", 20, finalY + 20)

    // Reset standard font for label
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.text("Authorized Signature", 20, finalY + 28)

    doc.setLineWidth(0.5)
    doc.line(20, finalY + 22, 90, finalY + 22)

    // Footer
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text('Thank you for your business. This is a computer-generated receipt.', 20, 280)

    doc.save(`Invoice_${data.reference}.pdf`)
}
