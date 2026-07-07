import { Router } from "express";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  adminController.updateUserStatus,
);

export const adminRoutes = router;
