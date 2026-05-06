const prisma = require('../config/prisma');

const listProducts = () => {
  return prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findProductById = (id) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
};

const createProduct = (data) => {
  return prisma.product.create({
    data,
    include: {
      category: true,
    },
  });
};

const updateProduct = (id, data) => {
  return prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });
};

const deleteProduct = (id) => {
  return prisma.product.delete({
    where: { id },
  });
};

module.exports = {
  listProducts,
  findProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
