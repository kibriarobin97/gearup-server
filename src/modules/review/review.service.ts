import { OrderStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { validateReview } from "../../utils/validate";
import { ICreateReviewPayload } from "./review.interface";

const createReview = async (
  customerId: string,
  payload: ICreateReviewPayload,
) => {
  const validationError = validateReview(payload);
  if (validationError) {
    throw new Error(validationError);
  }

  const { gearId, comment } = payload;

  const returnedOrder = await prisma.rentalOrder.findFirst({
    where: {
      gearId,
      customerId,
      status: OrderStatus.RETURNED,
    },
  });

  if (!returnedOrder) {
    throw new Error("You can only review gear you have rented and returned");
  }

  const existingReview = await prisma.review.findFirst({
    where: { gearId, customerId },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this gear");
  }

  const review = await prisma.review.create({
    data: {
      gearId,
      customerId,
      comment,
    },
    include: {
      customer: {
        select: { id: true, name: true },
      },
    },
  });

  return review;
};

const getGearReviews = async (gearId: string) => {
  const reviews = await prisma.review.findMany({
    where: { gearId },
    include: {
      customer: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews;
};

export const reviewService = {
  createReview,
  getGearReviews,
};
