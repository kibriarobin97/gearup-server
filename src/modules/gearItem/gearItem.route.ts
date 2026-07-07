import { Router } from "express";
import { gearController } from "./gearItem.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/gear", auth(UserRole.PROVIDER), gearController.createGear);

export const gearRoutes = router;
