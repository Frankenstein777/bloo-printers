
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const designTypes = [
    { type: 'Modern', adj: ['Sleek', 'Minimalist', 'Contemporary', 'Urban'] },
    { type: 'Traditional', adj: ['Classic', 'Heritage', 'Rustic', 'Colonial'] },
    { type: 'Cottage', adj: ['Cozy', 'Charming', 'Quaint', 'Countryside'] },
    { type: 'Villa', adj: ['Luxury', 'Spacious', 'Grand', 'Opulent'] },
    { type: 'Bungalow', adj: ['Practical', 'Accessible', 'Compact', 'Airy'] },
]

async function main() {
    // Clean up
    console.log('Cleaning up database...')
    await prisma.download.deleteMany()
    await prisma.purchase.deleteMany()
    await prisma.design.deleteMany()
    await prisma.user.deleteMany()

    // Create Users
    console.log('Creating users...')
    const admin = await prisma.user.create({
        data: {
            email: 'admin@bloo.com',
            passwordHash: 'hashedpassword',
            role: 'ADMIN',
        },
    })

    const subscriber = await prisma.user.create({
        data: {
            email: 'subscriber@bloo.com',
            passwordHash: 'hashedpassword',
            role: 'USER',
            subscriptionStatus: 'PREMIUM',
        },
    })

    const guest = await prisma.user.create({
        data: {
            email: 'guest@bloo.com',
            passwordHash: 'hashedpassword',
            role: 'USER',
            subscriptionStatus: 'FREE',
        },
    })

    console.log('Generating designs...')
    const designs = []

    // Generate 35 designs
    for (let i = 0; i < 35; i++) {
        const category = designTypes[Math.floor(Math.random() * designTypes.length)]
        const adjective = category.adj[Math.floor(Math.random() * category.adj.length)]
        const title = `${adjective} ${category.type} Plan ${i + 1}`

        let tier = 'FREE'
        let price = null
        const rand = Math.random()
        if (rand > 0.7) tier = 'PREMIUM'
        if (rand > 0.9) {
            tier = 'EXCLUSIVE'
            price = parseFloat((Math.random() * 500 + 100).toFixed(2))
        }

        const floors = Math.floor(Math.random() * 3) + 1
        const bedrooms = Math.floor(Math.random() * 5) + 3 // 3 to 7 beds
        const bathrooms = bedrooms // All ensuite
        const toilets = bedrooms + 1 // + Guest toilet
        const livingRooms = Math.floor(Math.random() * 2) + 1
        const stairs = floors > 1 ? Math.floor(Math.random() * 2) + 1 : 0
        const exits = Math.floor(Math.random() * 2) + 2 // 2 or 3 exits

        const plotWidth = Math.floor(Math.random() * 20) + 15
        const plotDepth = Math.floor(Math.random() * 20) + 20

        const hasPenthouse = floors > 1 && Math.random() > 0.7
        const hasBQ = Math.random() > 0.4

        designs.push({
            title: title + (hasPenthouse ? " + Penthouse" : ""),
            description: `A stunning ${title.toLowerCase()} featuring ${bedrooms} bedrooms, ${bathrooms} bathrooms, and ${livingRooms} living areas. ${hasPenthouse ? 'Includes a luxury penthouse suite. ' : ''}Perfect for a ${plotWidth}x${plotDepth}m plot.`,
            floors,
            bedrooms,
            bathrooms,
            toilets,
            livingRooms,
            stairs,
            exits,
            hasFamilyLounge: Math.random() > 0.3,
            hasPenthouse,
            hasStudy: Math.random() > 0.4,
            hasLaundry: true,
            hasStore: true,
            hasAnteRoom: Math.random() > 0.2,
            hasBQ,
            plotSize: `${plotWidth}x${plotDepth}m`,
            plotArea: plotWidth * plotDepth,
            tier,
            price, // Legacy price (will use defaults for modular if null)
            dwgUrl: i === 0 ? 'https://example.com/modern-villa.dwg' : `https://example.com/designs/${i}.dwg`,
            isFeatured: Math.random() > 0.8,
            previewImages: [
                `https://placehold.co/800x600/0a192f/64ffda?text=${encodeURIComponent(title)} - Front View`,
                `https://placehold.co/800x600/112240/64ffda?text=${encodeURIComponent(title)} - Side Elevation`,
                `https://placehold.co/800x600/233554/64ffda?text=${encodeURIComponent(title)} - Floor Plan`,
                `https://placehold.co/800x600/0a192f/00f2ff?text=${encodeURIComponent(title)} - Interior`
            ],
        })
    }

    for (const design of designs) {
        await prisma.design.create({ data: design })
    }

    console.log(`Seeding finished. Created ${designs.length} designs.`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
