// wipe-db.mjs — Run ONCE before going live to clear all data
// Usage: node wipe-db.mjs

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('⚠️  Starting full database wipe...')

  // Order matters due to foreign key constraints
  await prisma.collectionItem.deleteMany()
  console.log('✓ Deleted CollectionItems')

  await prisma.collection.deleteMany()
  console.log('✓ Deleted Collections')

  await prisma.comment.deleteMany()
  console.log('✓ Deleted Comments')

  await prisma.like.deleteMany()
  console.log('✓ Deleted Likes')

  await prisma.download.deleteMany()
  console.log('✓ Deleted Downloads')

  await prisma.purchase.deleteMany()
  console.log('✓ Deleted Purchases')

  await prisma.subscription.deleteMany()
  console.log('✓ Deleted Subscriptions')

  await prisma.aIRender.deleteMany()
  console.log('✓ Deleted AIRenders')

  await prisma.design.deleteMany()
  console.log('✓ Deleted Designs')

  await prisma.discount.deleteMany()
  console.log('✓ Deleted Discounts')

  await prisma.session.deleteMany()
  console.log('✓ Deleted Sessions')

  await prisma.account.deleteMany()
  console.log('✓ Deleted Accounts')

  await prisma.verificationToken.deleteMany()
  console.log('✓ Deleted VerificationTokens')

  await prisma.user.deleteMany()
  console.log('✓ Deleted Users')

  console.log('\n🎉 Database wiped clean. Ready to go live!')
}

main()
  .catch(e => { console.error('❌ Wipe failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
