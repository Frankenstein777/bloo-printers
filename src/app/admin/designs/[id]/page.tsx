
import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import DesignEditForm from '@/components/admin/DesignEditForm'
import Link from 'next/link'

const prisma = new PrismaClient()

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function AdminDesignEditPage({ params }: PageProps) {
    const session = await getSession()
    if (!session || session.user.role !== 'ADMIN') redirect('/')

    const id = (await params).id
    const design = await prisma.design.findUnique({
        where: { id }
    })

    if (!design) notFound()

    const sanitizedDesign = {
        ...design,
        price: design.price ? Number(design.price) : null,
        priceRender: Number(design.priceRender),
        priceDwg: Number(design.priceDwg),
        pricePdf: Number(design.pricePdf),
        priceElec: Number(design.priceElec),
        priceMech: Number(design.priceMech),
        priceStruct: Number(design.priceStruct),
        plotArea: Number(design.plotArea),
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/admin/designs"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Design</h1>
                        <p className="text-xs font-mono text-slate-500">{design.id}</p>
                    </div>
                </div>

                <DesignEditForm design={sanitizedDesign as any} />
            </div>
        </div>
    )
}
