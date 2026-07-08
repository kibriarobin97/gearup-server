import { prisma } from "../../lib/prisma";
import { ICreatePaymentPayload } from "./payment.interface";
import { v4 as uuidv4 } from "uuid";
import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";
import { sslCommerzUtils } from "./payment.utils";

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
      status: "PENDING",
      rentalOrderId: order.id,
    },
  });

  const sslResponse = await sslCommerzUtils.initiatePayment({
    amount: order.totalPrice,
    transactionId,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
  });

  return {
    paymentUrl: sslResponse.GatewayPageURL,
  };
};

const confirmPayment = async (transactionId: string, valId: string) => {
     console.log("Confirm payment input:", {
    transactionId,
    valId,
  });
  console.log("tranId:", transactionId);
console.log("valId:", valId);

  console.log("Before validatePayment");

const validation = await sslCommerzUtils.validatePayment(valId);

console.log("Validation:", validation);

    console.log("SSLCommerz validation full response:", validation);
  console.log("Validation status:", validation.status);
  console.log("Transaction ID from SSL:", validation.tran_id);


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
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: OrderStatus.PAID},
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
