const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || process.env.ADMIN_EMAIL;
  const password = args[1] || process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(`
Usage:
  node scripts/create_admin.js <email> <password>

Or with environment variables:
  ADMIN_EMAIL="admin@coolwave.cool" ADMIN_PASSWORD="your-secure-password" node scripts/create_admin.js
`);
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Das Administrator-Passwort muss mindestens 8 Zeichen lang sein.');
    process.exit(1);
  }

  const cleanEmail = email.toLowerCase().trim();
  console.log(`🔐 Creating/Promoting administrator account for: ${cleanEmail}...`);

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: cleanEmail },
    create: {
      email: cleanEmail,
      name: 'System Administrator',
      passwordHash,
      role: 'ADMIN',
      subscription: {
        create: {
          plan: 'business',
          status: 'active',
        },
      },
    },
    update: {
      role: 'ADMIN',
      passwordHash,
    },
  });

  // Record audit log
  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: 'ADMIN_PROMOTED',
      targetType: 'User',
      targetId: user.id,
      metadata: JSON.stringify({ email: cleanEmail, timestamp: new Date().toISOString() }),
    },
  }).catch(() => {});

  console.log(`✅ Administrator successfully configured:
  ID:    ${user.id}
  Email: ${user.email}
  Role:  ${user.role}
  Plan:  business
`);
}

main()
  .catch((err) => {
    console.error('Admin creation error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
