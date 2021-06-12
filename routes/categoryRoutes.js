import express from "express";
import {
  requireSignin,
  adminMiddleware,
} from "../controllers/authController.js";
import {
  createCategory,
  listAllCategory,
  singleCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { categoryCreateValidator } from "../validators/categoryValidators.js";

import { runValidation } from "../validators/index.js";

const router = express.Router();

router.post(
  "/category",
  categoryCreateValidator,
  runValidation,
  requireSignin,
  adminMiddleware,
  createCategory
);

router.get("/categories", listAllCategory);
router.get("/category/:slug", singleCategory);
router.delete("/category/:slug", deleteCategory);
export default router;
