const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[SECURITY ERROR] Cannot seed sample estimates in production!');
    process.exit(1);
  }

  console.log('Development sample estimation seed completed.');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
