import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { jwtUtils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";
import { UserRole } from "../../generated/prisma/enums";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw new Error(
        "You are not logged in, please login to access this resource",
      );
    }

    const verifiedToken = jwtUtils.verifyToken(token, config.JWT_ACCESS_SECRET);

    if (!verifiedToken.success) {
      throw new Error(verifiedToken.error);
    }

    const { name, email, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw new Error(
        "Forbidden, you don't have permission to access this resource",
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
        email,
      },
    });

    if (!user) {
      throw new Error("User not found. Please log in again.");
    }

    if (user.status === "SUSPENDED") {
      throw new Error(
        "Your account has been suspended. Please contact support.",
      );
    }

    req.user = {
      email,
      name,
      id,
      role,
    };

    next();
  });
};
