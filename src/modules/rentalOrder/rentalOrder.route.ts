import { Router } from "express";
import { rentalOrderController } from "./rentalOrder.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/",
  auth(UserRole.CUSTOMER),
  rentalOrderController.createRentalOrder,
);

router.get(
  "/",
  auth(UserRole.CUSTOMER),
  rentalOrderController.getMyRentalOrders,
);

router.get(
  "/orders",
  auth(UserRole.PROVIDER),
  rentalOrderController.getProviderOrders,
);

router.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  rentalOrderController.getRentalOrderById,
);

export const rentalOrderRoutes = router;
