const prisma = require('../config/prisma');

const createInvoiceNumber = () => {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `INV-${stamp}-${random}`;
};

const createTransaction = async ({ userId, items, paymentMethod = 'CASH', cashReceived }) => {
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const transactionItemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Produk dengan ID ${item.productId} tidak ditemukan.`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stok produk ${product.name} tidak mencukupi. Stok tersedia: ${product.stock}`
        );
      }

      const subtotal = Number(product.price) * item.quantity;
      totalAmount += subtotal;

      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
      });

      transactionItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const normalizedPaymentMethod = String(paymentMethod || 'CASH').toUpperCase();
    const cashReceivedNumber =
      cashReceived === undefined || cashReceived === null ? null : Number(cashReceived);

    if (normalizedPaymentMethod === 'CASH') {
      if (cashReceivedNumber === null || Number.isNaN(cashReceivedNumber)) {
        throw new Error('cashReceived wajib diisi untuk pembayaran tunai.');
      }

      if (cashReceivedNumber < totalAmount) {
        throw new Error('Cash received tidak mencukupi untuk pembayaran tunai.');
      }
    }

    const changeAmount =
      normalizedPaymentMethod === 'CASH'
        ? cashReceivedNumber - totalAmount
        : null;

    return tx.transaction.create({
      data: {
        invoiceNumber: createInvoiceNumber(),
        totalAmount,
        paymentMethod: normalizedPaymentMethod,
        cashReceived: cashReceivedNumber,
        changeAmount,
        userId,
        items: {
          create: transactionItemsData,
        },
      },
      include: {
        items: true,
      },
    });
  });
};

const listTransactions = () => {
  return prisma.transaction.findMany({
    include: {
      user: { select: { name: true, username: true, role: true } },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findTransactionById = (id) => {
  return prisma.transaction.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, username: true, role: true } },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
  });
};

module.exports = {
  createTransaction,
  listTransactions,
  findTransactionById,
};
