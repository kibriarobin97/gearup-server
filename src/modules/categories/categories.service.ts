import { prisma } from "../../lib/prisma";
import { validateCategory } from "../../utils/validate";

type TCategory = {
  name: string;
};

const createCategory = async (payload: TCategory) => {
  const validationError = validateCategory(payload);
  if (validationError) {
    throw new Error(validationError);
  }

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

const updateCategory = async (categoryId: string, payload: TCategory) => {
  const isExistsCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!isExistsCategory) {
    throw new Error("Category not found");
  }

  const updateCategory = await prisma.category.update({
    where: { id: categoryId },
    data: payload,
  });

  return updateCategory;
};

const deleteCategory = async (categoryId: string) => {
  const isExistsCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!isExistsCategory) {
    throw new Error("Category not found");
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });
};

export const categoriesService = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
