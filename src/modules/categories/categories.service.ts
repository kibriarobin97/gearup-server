import { prisma } from "../../lib/prisma";

const createCategory = async (payload: { name: string }) => {
  const isExists = await prisma.category.findUnique({
    where: { name: payload.name },
  });

  if (isExists) {
    throw new Error("Already exists this category");
  }
  const category = await prisma.category.create({
    data: payload,
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

export const categoriesService = {
  createCategory,
  getAllCategories,
};
