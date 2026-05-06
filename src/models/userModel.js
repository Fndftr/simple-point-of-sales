const prisma = require('../config/prisma');

const findUserByUsername = (username) => {
  return prisma.user.findUnique({
    where: { username },
  });
};

const findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const listUsers = () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const createUser = (data) => {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
};

const updateUser = (id, data) => {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const deleteUser = (id) => {
  return prisma.user.delete({
    where: { id },
  });
};

module.exports = {
  findUserByUsername,
  findUserById,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
