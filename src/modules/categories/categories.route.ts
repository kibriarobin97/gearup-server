import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.ADMIN), categoriesController.createCategories);

export const categoriesRoutes = router;
