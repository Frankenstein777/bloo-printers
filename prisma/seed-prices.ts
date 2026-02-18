import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Fetching all designs...')
    const designs = await prisma.design.findMany()

    console.log(`Found ${designs.length} designs. Updating prices...`)

    for (const design of designs) {
        // Helper to generate random price rounded to nearest 1000
        const randomPrice = (min: number, max: number) => {
            const range = (max - min) / 1000
            const random = Math.floor(Math.random() * (range + 1))
            return (min + (random * 1000))
        }

        const priceRender = randomPrice(5000, 25000)
        const pricePdf = randomPrice(20000, 50000)
        const priceDwg = randomPrice(50000, 150000)

        // Specialized drawings (Electrical, Mechanical, Structural)
        const priceElec = randomPrice(10000, 30000)
        const priceMech = randomPrice(10000, 30000)
        const priceStruct = randomPrice(10000, 30000)

        // Base price (usually PDF or Render depending on strategy, but let's set it to Render for "min" display)
        const basePrice = priceRender

        await prisma.design.update({
            where: { id: design.id },
            data: {
                price: basePrice, // Used for "From X" display if needed
                priceRender,
                pricePdf,
                priceDwg,
                priceElec,
                priceMech,
                priceStruct
            }
        })

        process.stdout.write('.')
    }

    console.log('\n✅ All designs updated with randomized prices.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
