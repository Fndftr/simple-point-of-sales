const prisma = require('../config/prisma');

const getSalesSummary = async ({ startDate, endDate }) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              stock: true,
              price: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const productMap = new Map();
  const paymentMethodMap = new Map();
  let totalSales = 0;
  let itemsSold = 0;

  for (const transaction of transactions) {
    totalSales += Number(transaction.totalAmount);
    paymentMethodMap.set(
      transaction.paymentMethod,
      (paymentMethodMap.get(transaction.paymentMethod) || 0) + 1
    );

    for (const item of transaction.items) {
      itemsSold += item.quantity;

      const existing = productMap.get(item.productId) || {
        productId: item.productId,
        productName: item.product.name,
        categoryName: item.product.category?.name || null,
        quantitySold: 0,
        revenue: 0,
      };

      existing.quantitySold += item.quantity;
      existing.revenue += Number(item.price) * item.quantity;
      productMap.set(item.productId, existing);
    }
  }

  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: 10,
      },
    },
    include: {
      category: true,
    },
    orderBy: [{ stock: 'asc' }, { name: 'asc' }],
  });

  return {
    period: {
      startDate: startDate || null,
      endDate: endDate || null,
    },
    totalTransactions: transactions.length,
    totalSales,
    itemsSold,
    averageTicket: transactions.length > 0 ? totalSales / transactions.length : 0,
    paymentMethodSummary: Array.from(paymentMethodMap.entries()).map(([method, count]) => ({
      method,
      count,
    })),
    topProducts,
    lowStockProducts,
    transactions,
  };
};

module.exports = {
  getSalesSummary,
};
