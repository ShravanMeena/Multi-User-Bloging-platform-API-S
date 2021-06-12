import express from "express";
import {
  requireSignin,
  adminMiddleware,
} from "../controllers/authController.js";

import {
  createTag,
  listAllTag,
  singleTag,
  deleteTag,
} from "../controllers/tagController.js";
import { tagCreateValidator } from "../validators/tagValidators.js";

import { runValidation } from "../validators/index.js";

const router = express.Router();

router.post(
  "/tag",
  tagCreateValidator,
  runValidation,
  requireSignin,
  adminMiddleware,
  createTag
);

router.get("/tags", listAllTag);
router.get("/tag/:slug", singleTag);
router.delete("/tag/:slug", deleteTag);

export default router;
