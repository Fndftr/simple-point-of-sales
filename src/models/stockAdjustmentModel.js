const prisma = require('../config/prisma');

const listStockAdjustments = () => {
  return prisma.stockAdjustment.findMany({
    include: {
      product: {
        select: {
          id: true,
          name: true,
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
};

const createStockAdjustment = (data) => {
  return prisma.stockAdjustment.create({
    data,
    include: {
      product: {
        select: {
          id: true,
          name: true,
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
  });
};

module.exports = {
  listStockAdjustments,
  createStockAdjustment,
};
