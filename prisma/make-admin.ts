// @ts-nocheck
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Please provide an email address: npx ts-node prisma/make-admin.ts <email>')
        process.exit(1)
    }

    console.log(`Looking for user with email: ${email}...`)

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            console.error('User not found! Please log in with Google first so your account is created.')
            process.exit(1)
        }

        const updated = await prisma.user.update({
            where: { email },
            data: {
                role: 'ADMIN',
                subscriptionStatus: 'PREMIUM' // Admins get premium too
            }
        })

        console.log(`Success! User ${updated.email} is now an ADMIN.`)
        console.log('You may need to log out and log back in for changes to take effect.')
    } catch (e) {
        console.error('Error updating user:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
