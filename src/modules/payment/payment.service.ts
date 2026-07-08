import { prisma } from "../../lib/prisma";
import { sslcommerzUtils } from "./payment.utils";
import { ICreatePaymentPayload } from "./payment.interface";
import { v4 as uuidv4 } from "uuid";

const createPayment = async (
  customerId: string,
  payload: ICreatePaymentPayload,
) => {
  const { rentalOrderId } = payload;

  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { customer: true },
  });

  if (!order) {
    throw new Error("Rental order not found");
  }

  if (order.customerId !== customerId) {
    throw new Error("You can only pay for your own order");
  }

  if (order.status !== "CONFIRMED") {
    throw new Error("Order must be confirmed by provider before payment");
  }

  const transactionId = `GEARUP_${uuidv4()}`;

  await prisma.payment.create({
    data: {
      transactionId,
      amount: order.totalPrice,
      method: "SSLCOMMERZ",
      status: "PENDING",
      rentalOrderId: order.id,
    },
  });

  const sslResponse = await sslcommerzUtils.initiatePayment({
    amount: order.totalPrice,
    transactionId,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
  });

  return {
    paymentUrl: sslResponse.GatewayPageURL,
  };
};

const confirmPayment = async (transactionId: string, val_id: string) => {
  const validation = await sslcommerzUtils.validatePayment(val_id);

  if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
    throw new Error("Payment validation failed");
  }

  const payment = await prisma.payment.findUnique({
    where: { transactionId },
  });

  if (!payment) {
    throw new Error("Payment record not found");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { transactionId },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });

    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: "PAID" },
    });

    return updatedPayment;
  });

  return result;
};

const getMyPayments = async (customerId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      rentalOrder: { customerId },
    },
    include: {
      rentalOrder: {
        include: {
          gear: { select: { name: true, pricePerDay: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments;
};

const getPaymentById = async (paymentId: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.rentalOrder.customerId !== customerId) {
    throw new Error("You are not allowed to view this payment");
  }

  return payment;
};

export const paymentService = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
