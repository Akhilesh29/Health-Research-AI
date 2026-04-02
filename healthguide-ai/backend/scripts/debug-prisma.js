const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '../.env');
let envLine = '';
try {
  const raw = fs.readFileSync(envPath, 'utf8');
  const match = raw.match(/^DATABASE_URL=.*$/m);
  envLine = match ? match[0] : '';
} catch (e) {
  envLine = `Failed to read: ${String(e)}`;
}

console.log('Using env file:', envPath);
console.log('DATABASE_URL from file:', envLine);

dotenv.config({
  path: envPath,
  override: true,
});

console.log('DB URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma
  .$connect()
  .then(async () => {
    console.log('Prisma connected OK');
    await prisma.$disconnect();
  })
  .catch((e) => {
    console.error('Prisma connect error:', e.message);
    console.error('Prisma code:', e.code);
    process.exit(1);
  });

