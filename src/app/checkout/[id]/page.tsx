import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import PaystackCheckout from '@/components/PaystackCheckout'

const prisma = new PrismaClient()

export default async function CheckoutPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const session = await getSession()

    if (!session) {
        redirect(`/login?callbackUrl=/checkout/${id}`)
    }

    const design = await prisma.design.findUnique({
        where: { id }
    })

    if (!design) notFound()

    // Default Prices (Fallback if DB is empty)
    const prices = {
        render: Number(design.priceRender || 10000),
        dwg: Number(design.priceDwg || 70000),
        pdf: Number(design.pricePdf || 40000),
        elec: Number(design.priceElec || 10000),
        mech: Number(design.priceMech || 10000),
        struct: Number(design.priceStruct || 30000)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Complete Your Purchase</h1>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 md:p-12 max-w-2xl mx-auto">
                <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
                    <h2 className="text-xl font-semibold mb-2">{design.title}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{design.description?.slice(0, 100)}...</p>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-[#00a3ad] dark:text-[#00f2ff]">
                            ₦{(Number(design.price || 2000)).toLocaleString()}
                        </span>
                    </div>
                </div>

                <PaystackCheckout
                    email={session.user.email!}
                    amount={(Number(design.price || 2000)) * 100} // Convert to Kobo
                    designId={design.id}
                    designTitle={design.title}
                />
            </div>
        </div>
    )
}
