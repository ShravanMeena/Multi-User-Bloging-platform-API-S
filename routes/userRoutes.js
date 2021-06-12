import express from "express";
import {
  requireSignin,
  authMiddleware,
} from "../controllers/authController.js";

import {
  photoOfUser,
  publicProfile,
  userUpdate,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/user/:username", publicProfile);
router.put("/user/update", requireSignin, authMiddleware, userUpdate);
router.get("/user/photo/:username", photoOfUser);

export default router;
