#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const bcrypt = require('bcrypt');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diatur di file .env');
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL),
});

async function main() {
  console.log('Memulai seeding POS...');

  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.stockAdjustment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const categories = await prisma.category.createMany({
    data: [
      { name: 'Makanan', description: 'Menu makanan utama' },
      { name: 'Minuman', description: 'Menu minuman' },
      { name: 'Add On', description: 'Tambahan menu' },
    ],
  });

  const allCategories = await prisma.category.findMany();
  const categoryMap = new Map(allCategories.map((category) => [category.name, category.id]));

  const products = [
    {
      name: 'Banh Mi Ga Xao Nam (Honey grilled chicken with mushroom)',
      price: 31000,
      stock: 20,
      categoryId: categoryMap.get('Makanan'),
    },
    {
      name: 'Banh Mi Trung And Bo Qua (Egg, Cheese, Avocado)',
      price: 30300,
      stock: 15,
      categoryId: categoryMap.get('Makanan'),
    },
    {
      name: 'Banh Mi Bo Pho Mai (Sauteed Beef With Mozarella)',
      price: 37500,
      stock: 25,
      categoryId: categoryMap.get('Makanan'),
    },
    {
      name: 'Chicken Char Siu (Additional)',
      price: 6000,
      stock: 50,
      categoryId: categoryMap.get('Add On'),
    },
    {
      name: 'Telur (Additional)',
      price: 4000,
      stock: 50,
      categoryId: categoryMap.get('Add On'),
    },
    {
      name: 'Es Teh Manis',
      price: 7000,
      stock: 40,
      categoryId: categoryMap.get('Minuman'),
    },
  ];

  await prisma.product.createMany({
    data: products,
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  const kasirPassword = await bcrypt.hash('kasir123', 10);

  await prisma.user.createMany({
    data: [
      {
        name: 'Super Admin',
        username: 'admin',
        password: adminPassword,
        role: 'SUPERADMIN',
      },
      {
        name: 'Kasir Utama',
        username: 'kasir',
        password: kasirPassword,
        role: 'KASIR',
      },
    ],
  });

  console.log('Seeding berhasil: kategori, produk, dan user utama sudah dibuat.');
}

main()
  .catch((e) => {
    console.error('Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
