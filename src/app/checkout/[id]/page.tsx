import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import CheckoutClient from '@/components/CheckoutClient'

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

    // Default Prices (Fallback to 0 if not set, avoiding arbitrary defaults)
    const prices = {
        render: Number(design.priceRender || 0),
        dwg: Number(design.priceDwg || 0),
        pdf: Number(design.pricePdf || 0),
        elec: Number(design.priceElec || 0),
        mech: Number(design.priceMech || 0),
        struct: Number(design.priceStruct || 0)
    }

    return (
        <CheckoutClient
            design={{
                ...design,
                price: Number(design.price || 0),
                priceRender: Number(design.priceRender || 0),
                priceDwg: Number(design.priceDwg || 0),
                pricePdf: Number(design.pricePdf || 0),
                priceElec: Number(design.priceElec || 0),
                priceMech: Number(design.priceMech || 0),
                priceStruct: Number(design.priceStruct || 0),
            }}
            prices={prices}
            userEmail={session.user.email || undefined}
            isSubscriber={(session.user as any).subscriptionStatus === 'PREMIUM' || (session.user as any).role === 'ADMIN'}
        />
    )
}
