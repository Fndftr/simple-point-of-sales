const prisma = require('../config/prisma');

const listCategories = () => {
  return prisma.category.findMany({
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const findCategoryById = (id) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      products: {
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
        },
      },
    },
  });
};

const findCategoryByName = (name) => {
  return prisma.category.findUnique({
    where: { name },
  });
};

const createCategory = (data) => {
  return prisma.category.create({
    data,
  });
};

const updateCategory = (id, data) => {
  return prisma.category.update({
    where: { id },
    data,
  });
};

const deleteCategory = (id) => {
  return prisma.category.delete({
    where: { id },
  });
};

module.exports = {
  listCategories,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategory,
  deleteCategory,
};
