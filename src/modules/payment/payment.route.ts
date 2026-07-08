import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create",
  auth(UserRole.CUSTOMER),
  paymentController.createPayment,
);

router.post("/confirm", paymentController.confirmPayment);

router.get("/", auth(UserRole.CUSTOMER), paymentController.getMyPayments);

router.get(
  "/:id",
  auth(UserRole.CUSTOMER),
  paymentController.getPaymentById,
);

export const paymentRoutes = router;