import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await paymentService.createPayment(customerId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment session created successfully",
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { tran_id, val_id } = req.body;

  await paymentService.confirmPayment(tran_id, val_id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Payment completed successfully",
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const customerId = req.user!.id;
  const result = await paymentService.getMyPayments(customerId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payments fetched successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const customerId = req.user?.id;
  const result = await paymentService.getPaymentById(
    id as string,
    customerId as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment fetched successfully",
    data: result,
  });
});

export const paymentController = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
