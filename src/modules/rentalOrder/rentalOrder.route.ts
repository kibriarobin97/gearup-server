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

router.get("/", auth("CUSTOMER"), rentalOrderController.getMyRentalOrders);

export const rentalOrderRoutes = router;
