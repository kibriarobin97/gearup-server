import { Router } from "express";
import { gearController } from "./gearItem.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.PROVIDER), gearController.createGear);

router.get("/", gearController.getAllGear);

router.get("/:id", gearController.getSingleGear);

router.patch("/:id", auth(UserRole.PROVIDER), gearController.updateGear);

router.delete("/:id", auth(UserRole.PROVIDER), gearController.deleteGear);

export const gearRoutes = router;
