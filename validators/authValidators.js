import { check } from "express-validator";

export const userRegistrationValidator = [
  check("name").not().isEmpty().withMessage("Name is required!"),
  check("email").isEmail().withMessage("Must be a valid email address"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("must be at least 6 chars long"),
];

export const userSigninValidator = [
  check("email").isEmail().withMessage("Must be a valid email address"),
  check("password").isLength({ min: 6 }).withMessage("Wrong password"),
];
