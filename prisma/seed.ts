import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HOSTS = [
  'Andrew',
  '師傅',
  '燊',
  'Yandy',
  'Victor',
  'Cindy',
  'Cathy',
  // Add 3 more host names here when confirmed
]

async function main() {
  console.log('🌱 Seeding database...')

  // Seed hosts
  for (const name of HOSTS) {
    await prisma.host.upsert({
      where: { id: HOSTS.indexOf(name) + 1 },
      update: { name },
      create: { name },
    })
  }
  console.log(`✅ Seeded ${HOSTS.length} hosts`)

  // Seed admin PIN hash from env
  const pinHash = process.env.ADMIN_PIN_HASH
  if (!pinHash || pinHash.startsWith('run-the-command')) {
    throw new Error(
      '❌ ADMIN_PIN_HASH is not set in .env.local\n' +
      '   Run: node -e "const b=require(\'bcryptjs\');console.log(b.hashSync(\'YOUR_PIN\',12))"\n' +
      '   Then add the output to .env.local as ADMIN_PIN_HASH'
    )
  }

  await prisma.adminConfig.upsert({
    where:  { id: 1 },
    update: { pinHash },
    create: { pinHash },
  })
  console.log('✅ Seeded admin PIN')

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
