const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envLocal = path.resolve(__dirname, '../.env.local');
const env = path.resolve(__dirname, '../.env');
const selected = fs.existsSync(envLocal) ? envLocal : env;

dotenv.config({ path: selected, override: true });

console.log('Using env:', selected);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const email = `debug_${Date.now()}@example.com`;

(async () => {
  const started = Date.now();
  try {
    await prisma.$connect();
    console.log('Connected');

    const user = await prisma.user.create({
      data: {
        name: 'Debug User',
        email,
        passwordHash: 'debug_hash',
      },
      select: { id: true, email: true, createdAt: true },
    });

    console.log('Created user:', user);
    console.log('Elapsed ms:', Date.now() - started);
  } finally {
    await prisma.$disconnect();
  }
})().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});

