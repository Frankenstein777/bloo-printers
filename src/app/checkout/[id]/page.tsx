import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import CheckoutClient from '@/components/CheckoutClient'

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
        <CheckoutClient
            design={{
                ...design,
                price: design.price ? Number(design.price) : null,
                priceRender: Number(design.priceRender || 0),
                priceDwg: Number(design.priceDwg || 0),
                pricePdf: Number(design.pricePdf || 0),
                priceElec: Number(design.priceElec || 0),
                priceMech: Number(design.priceMech || 0),
                priceStruct: Number(design.priceStruct || 0),
            }}
            prices={prices}
            userEmail={session.user.email || undefined}
        />
    )
}
