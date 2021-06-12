import express from "express";
import {
  registerController,
  loginController,
  userLogoutController,
  requireSignin,
  adminMiddleware,
  read,
} from "../controllers/authController.js";
import {
  userRegistrationValidator,
  userSigninValidator,
} from "../validators/authValidators.js";
import { runValidation } from "../validators/index.js";
const router = express.Router();

router.post(
  "/register",
  userRegistrationValidator,
  runValidation,
  registerController
);

router.post("/login", userSigninValidator, runValidation, loginController);
router.get("/logout", userLogoutController);

// secret route for test
router.get("/secret", requireSignin, adminMiddleware, read, (req, res) => {
  res.status(200).json({ secret_msg: "Amazing you are access secret ", user });
});

export default router;
