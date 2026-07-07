import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { gearService } from "./gearItem.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user?.id;
  const payload = req.body;

  const result = await gearService.createGear(providerId as string, payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Gear created successfully",
    data: result,
  });
});

export const gearController = {
  createGear,
};
