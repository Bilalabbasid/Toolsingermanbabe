const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Seed initial Admin Settings
  const defaultSettings = [
    {
      key: 'general.maintenance_mode',
      value: JSON.stringify(false),
      description: 'Global maintenance mode toggle',
    },
    {
      key: 'monetization.ads_enabled',
      value: JSON.stringify(true),
      description: 'Display Google AdSense slots for free tier visitors',
    },
    {
      key: 'monetization.billing_enabled',
      value: JSON.stringify(true),
      description: 'Allow Stripe subscription upgrades and checkout',
    },
    {
      key: 'limits.free_file_size_mb',
      value: JSON.stringify(50),
      description: 'Default maximum file size for free users (MB)',
    },
    {
      key: 'limits.pro_file_size_mb',
      value: JSON.stringify(500),
      description: 'Default maximum file size for pro subscribers (MB)',
    },
    {
      key: 'storage.temp_retention_minutes',
      value: JSON.stringify(15),
      description: 'Retention period for temporary conversion files before auto-deletion',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.adminSettings.upsert({
      where: { key: setting.key },
      create: setting,
      update: { description: setting.description },
    });
  }
  console.log('✓ Initial AdminSettings seeded');

  // 2. Seed initial Administrator if environment variables provided
  const adminEmail = process.env.ADMIN_INITIAL_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase().trim() },
      create: {
        email: adminEmail.toLowerCase().trim(),
        name: 'CoolWave Administrator',
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
    console.log(`✓ Initial Administrator created/promoted: ${admin.email}`);
  } else {
    console.log('ℹ No ADMIN_INITIAL_EMAIL / ADMIN_INITIAL_PASSWORD specified. Skipping admin creation. Run "npm run admin:create" to create an admin.');
  }

  console.log('✅ Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
