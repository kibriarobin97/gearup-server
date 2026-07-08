import { UserRole } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { validateRentalOrder } from "../../utils/validate";
import {
  ICreateRentalOrderPayload,
  IUpdateOrderStatusPayload,
} from "./rentalOrder.interface";

const createRentalOrder = async (
  customerId: string,
  payload: ICreateRentalOrderPayload,
) => {
  const validationError = validateRentalOrder(payload);
  if (validationError) {
    throw new Error(validationError);
  }

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

const getRentalOrderById = async (
  orderId: string,
  userId: string,
  userRole: UserRole,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gear: {
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const isOwnerCustomer = order.customerId === userId;
  const isOwnerProvider = order.gear.providerId === userId;

  const isAdmin = userRole === "ADMIN";

  if (!isAdmin && !isOwnerCustomer && !isOwnerProvider) {
    throw new Error("You are not allowed to access this order");
  }

  return order;
};

const getProviderOrders = async (providerId: string) => {
  const orders = await prisma.rentalOrder.findMany({
    where: {
      gear: {
        providerId,
      },
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      gear: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return orders;
};

const validTransitions: Record<string, string[]> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: [],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};

const updateOrderStatus = async (
  orderId: string,
  userId: string,
  userRole: UserRole,
  payload: IUpdateOrderStatusPayload,
) => {
  const newStatus = payload.status;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: { gear: true },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  const currentStatus = order.status;

  const isOwnerProvider = order.gear.providerId === userId;
  const isOwnerCustomer = order.customerId === userId;

  if (!isOwnerProvider && !isOwnerCustomer) {
    throw new Error("You are not allowed to update this order");
  }

  if (newStatus === "CANCELLED" && userRole !== "CUSTOMER") {
    throw new Error("Only the customer can cancel an order");
  }

  if (
    ["CONFIRMED", "PICKED_UP", "RETURNED"].includes(newStatus) &&
    userRole !== "PROVIDER"
  ) {
    throw new Error("Only the provider can update this status");
  }

  const allowedNextSteps = validTransitions[currentStatus] || [];

  if (!allowedNextSteps.includes(newStatus)) {
    throw new Error(
      `Cannot change status from ${currentStatus} to ${newStatus}`,
    );
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedOrder = await tx.rentalOrder.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    if (newStatus === "CANCELLED" || newStatus === "RETURNED") {
      await tx.gearItem.update({
        where: { id: order.gearId },
        data: {
          availableCount: { increment: order.quantity },
        },
      });
    }

    return updatedOrder;
  });

  return result;
};

export const rentalOrderService = {
  createRentalOrder,
  getMyRentalOrders,
  getRentalOrderById,
  getProviderOrders,
  updateOrderStatus,
};
