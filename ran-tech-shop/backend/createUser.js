const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  const hashedPassword = await bcrypt.hash('RanTech2025!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@rantech.com' },
    update: {},
    create: {
      email: 'admin@rantech.com',
      password: hashedPassword,
      name: 'Admin User'
    }
  });
  
  console.log('✅ Created user account:');
  console.log('   Email: admin@rantech.com');
  console.log('   Password: RanTech2025!');
}

createUser()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
