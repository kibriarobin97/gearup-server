import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

router.post("/", auth(UserRole.ADMIN), categoriesController.createCategories);

router.get("/", categoriesController.getAllCategories);

router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  categoriesController.updateCategory,
);

router.delete(
  "/:id",
  auth(UserRole.ADMIN),
  categoriesController.deleteCategory,
);

export const categoriesRoutes = router;
