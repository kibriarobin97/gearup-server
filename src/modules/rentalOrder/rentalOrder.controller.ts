import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalOrderService } from "./rentalOrder.service";
import { sendResponse } from "../../utils/sendResponse";
import { UserRole } from "../../../generated/prisma/enums";

const createRentalOrder = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const payload = req.body;
  const result = await rentalOrderService.createRentalOrder(
    customerId as string,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Rental order placed successfully",
    data: result,
  });
});

const getMyRentalOrders = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user?.id;
  const result = await rentalOrderService.getMyRentalOrders(
    customerId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

const getRentalOrderById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;

  const result = await rentalOrderService.getRentalOrderById(
    id as string,
    userId as string,
    userRole as UserRole,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Rental order retrieved successfully",
    data: result,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const result = await rentalOrderService.getProviderOrders(providerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Provider orders retrieved successfully",
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.user?.id;
  const userRole = req.user?.role;
  const payload = req.body;

  const result = await rentalOrderService.updateOrderStatus(
    id as string,
    userId as string,
    userRole as UserRole,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Order status updated successfully",
    data: result,
  });
});

export const rentalOrderController = {
  createRentalOrder,
  getMyRentalOrders,
  getRentalOrderById,
  getProviderOrders,
  updateOrderStatus,
};
