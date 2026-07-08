import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { Prisma } from "../../generated/prisma/client";
import config from "../config";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode;
  let errorMessage = err.message || "Internal server error";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      errorMessage = "Duplicate field value entered";
    } else if (err.code === "P2023") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage =
        "Foreign key constraint failed. The referenced record does not exist.";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      errorMessage = "The requested resource was not found in the database.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage =
        "Database connection failed. Please check your credentials.";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.SERVICE_UNAVAILABLE;
      errorMessage =
        "Database connection failed. Please check if the database server is running.";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "An unknown error occurred while processing the request.";
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  } else if (err instanceof Error) {
    const msg = err.message.toLowerCase();

    if (
      msg.includes("not found") ||
      msg.includes("does not exist") ||
      msg.includes("no user found")
    ) {
      statusCode = httpStatus.NOT_FOUND;
    } else if (
      msg.includes("already exists") ||
      msg.includes("already reviewed") ||
      msg.includes("already have")
    ) {
      statusCode = httpStatus.CONFLICT;
    } else if (
      msg.includes("not allowed") ||
      msg.includes("only the") ||
      msg.includes("permission") ||
      msg.includes("suspended") ||
      msg.includes("your own") ||
      msg.includes("forbidden")
    ) {
      statusCode = httpStatus.FORBIDDEN;
    } else if (
      msg.includes("incorrect password") ||
      msg.includes("not logged in") ||
      msg.includes("validation failed") ||
      (msg.includes("invalid") && msg.includes("token"))
    ) {
      statusCode = httpStatus.UNAUTHORIZED;
    } else if (
      msg.includes("cannot") ||
      msg.includes("must be") ||
      msg.includes("required") ||
      msg.includes("only available") ||
      msg.includes("quantity")
    ) {
      statusCode = httpStatus.BAD_REQUEST;
    } else {
      statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    }

    errorMessage = err.message;
  }

  res.status(statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: errorMessage,
    errorDetails: {
      statusCode: statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      ...(config.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};