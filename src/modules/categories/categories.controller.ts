import httpStatus from "http-status";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoriesService } from "./categories.service";
import { sendResponse } from "../../utils/sendResponse";

const createCategories = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;

  const result = await categoriesService.createCategory(payload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Category created successfully",
    data: result,
  });
});

export const categoriesController = {
  createCategories,
};
