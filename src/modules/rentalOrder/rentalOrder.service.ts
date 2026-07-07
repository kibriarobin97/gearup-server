import { prisma } from "../../lib/prisma";
import { ICreateRentalOrderPayload } from "./rentalOrder.interface";

const createRentalOrder = async (
  customerId: string,
  payload: ICreateRentalOrderPayload,
) => {
  const { gearId, startTime, endTime, quantity } = payload;

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start < new Date()) {
    throw new Error("Start time cannot be in the past");
  }

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new Error("Gear not found");
  }

  if (gear.availableCount < quantity) {
    throw new Error(`Only ${gear.availableCount} unit's are available.`);
  }

  const durationMs = end.getTime() - start.getTime();
  const days = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

  const totalPrice = gear.pricePerDay * quantity * days;

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.rentalOrder.create({
      data: {
        customerId,
        gearId,
        startTime: start,
        endTime: end,
        quantity,
        totalPrice,
      },
    });

    await tx.gearItem.update({
      where: { id: gearId },
      data: {
        availableCount: { decrement: quantity },
      },
    });

    return order;
  });

  return result;
};

const getMyRentalOrders = async (customerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: { customerId },
    include: {
      gear: {
        select: {
          id: true,
          name: true,
          pricePerDay: true,
          brand: true,
          model: true,
          provider: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

export const rentalOrderService = {
  createRentalOrder,
  getMyRentalOrders
};
