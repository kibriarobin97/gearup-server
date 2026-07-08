import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { validateGear } from "../../utils/validate";
import {
  ICreateGearPayload,
  IGearQuery,
  IUpdateGearPayload,
} from "./gearItem.interface";

const createGear = async (providerId: string, payload: ICreateGearPayload) => {
  const validationError = validateGear(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  const category = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!category) {
    throw new Error("This category is not available");
  }

  const isDuplicate = await prisma.gearItem.findFirst({
    where: {
      name: payload.name,
      providerId,
    },
  });

  if (isDuplicate) {
    throw new Error("You already have a gear item with this name");
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

const getAllGear = async (query: IGearQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;
  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";

  const andConditions: Prisma.GearItemWhereInput[] = [];

  if (query.searchItem) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: query.searchItem,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.searchItem,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.category) {
    andConditions.push({
      category: {
        name: {
          equals: query.category,
          mode: "insensitive",
        },
      },
    });
  }

  if (query.brand) {
    andConditions.push({
      brand: {
        contains: query.brand,
        mode: "insensitive",
      },
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      pricePerDay: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }

  andConditions.push({
    availableCount: { gt: 0 },
  });

  const gears = await prisma.gearItem.findMany({
    // search & filter
    where: {
      AND: andConditions,
    },
    // pagination
    take: limit,
    skip: skip,
    // sort
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      category: true,
      provider: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  const totalGearsCount = await prisma.gearItem.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    data: gears,
    meta: {
      page: page,
      limit: limit,
      total: totalGearsCount,
      totalPages: Math.ceil(totalGearsCount / limit),
    },
  };
};

const getSingleGear = async (gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
    include: {
      category: {
        select: {
          name: true,
        },
      },
      provider: {
        select: {
          name: true,
          email: true,
        },
      },
      reviews: true,
    },
  });

  if (!gear) {
    throw new Error("Gear not found");
  }

  return gear;
};

const updateGear = async (
  gearId: string,
  providerId: string,
  payload: IUpdateGearPayload,
) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new Error("Gear not found");
  }

  if (gear.providerId !== providerId) {
    throw new Error("You can only update your own gear");
  }

  const updateGear: any = { ...payload };
  if (payload.totalStock !== undefined) {
    const stockDifference = payload.totalStock - gear.totalStock;
    const newAvailableCount = gear.availableCount + stockDifference;

    if (newAvailableCount < 0) {
      throw new Error("Cannot reduce stock below currently rented quantity");
    }

    updateGear.availableCount = newAvailableCount;
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });

    if (!category) {
      throw new Error("This category is not available");
    }
  }

  const result = await prisma.gearItem.update({
    where: { id: gearId },
    data: updateGear,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteGear = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new Error("Gear not found");
  }

  if (gear.providerId !== providerId) {
    throw new Error("You can only delete your own gear");
  }

  await prisma.gearItem.delete({
    where: { id: gearId },
  });

  return null;
};

export const gearService = {
  createGear,
  getAllGear,
  getSingleGear,
  updateGear,
  deleteGear,
};
