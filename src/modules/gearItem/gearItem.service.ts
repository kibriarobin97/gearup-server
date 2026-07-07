import { prisma } from "../../lib/prisma";
import { ICreateGearPayload } from "./gearItem.interface";

const createGear = async (providerId: string, payload: ICreateGearPayload) => {
  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new Error("This category is not available");
  }

  const stock = payload.totalStock || 1;

  const gear = await prisma.gearItem.create({
    data: {
      ...payload,
      providerId,
      totalStock: stock,
      availableCount: stock,
    },
  });

  return gear;
};

export const gearService = {
  createGear,
};
