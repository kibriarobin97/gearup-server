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

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const result = await gearService.getAllGear(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear items fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await gearService.getSingleGear(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear item fetched successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const providerId = req.user!.id;
  const payload = req.body;

  const result = await gearService.updateGear(
    id as string,
    providerId,
    payload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const gearId = req.params.id;
  const providerId = req.user?.id;

  await gearService.deleteGear(gearId as string, providerId as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Gear deleted successfully",
    data: null,
  });
});

export const gearController = {
  createGear,
  getAllGear,
  getSingleGear,
  updateGear,
  deleteGear,
};
