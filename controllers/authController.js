import User from "../models/userModel.js";
import shortId from "shortid";
import jwt from "jsonwebtoken";

// this will help us to token is expired or  token is valid
import expressJwt from "express-jwt";
import Blog from "../models/blogModel.js";

const registerController = async (req, res) => {
  const { name, email, password, role } = req.body;

  // user exist
  let user = await User.findOne({ email }).exec();
  if (user) {
    return res.status(400).json({ error: "Email is taken" });
  }

  // if user not exist then
  let username = shortId.generate();
  let profile = `${process.env.CLIENT_URL}/profile/${username}`;

  let newUser = new User({ name, email, password, username, profile, role });
  await newUser.save((err, success) => {
    if (err) {
      return res.status(400).json({ success: false, error: err });
    }
    res.json({
      success: true,
      message: "You have registered succesfully, please signin",
      user: success,
    });
  });
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  // user exist or not
  await User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email does not exist, Please register",
      });
    }

    // if user exist then
    // authenticate (password comparison function from server.js)
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match",
      });
    }

    // if everything ok then genrate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, { expiresIn: "7d" });

    const { _id, name, email, username, role } = user;

    return res.status(200).json({
      token,
      user: {
        _id,
        name,
        email,
        username,
        role,
      },
    });
  });
};

const userLogoutController = (req, res) => {
  res.clearCookie("token");
  res.json({
    succes: true,
    message: "You are logout successfully!",
  });
};

// middlewares
const read = (req, res, next) => {
  req.profile.hashed_password = undefined;

  return res.status(200).json({ user: req.profile });
};

// require signin middleware
const requireSignin = expressJwt({
  secret: process.env.JWT_KEY,
  algorithms: ["HS256"],
});

// authenticated user middleware
const authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: "User with that email does not found" });
    }

    // if user exist
    req.profile = user;
    next();
  });
};

// admin user middleware

const adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: "User with that email does not found" });
    }

    // admin user or not
    if (user.role !== 1) {
      return res.status(400).json({ error: "You are not authorized!" });
    }

    req.profile = user;
    next();
  });
};

const canUpdateAndDeleteBlog = (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  Blog.findOne({ slug }).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "blog does not found" });
    }

    let isAuthorizedUser =
      data.postedBy._id.toString() === req.profile._id.toString();

    if (!isAuthorizedUser) {
      return res.status(400).json({ error: "You are not authorized!" });
    }
    next();
  });
};

export {
  registerController,
  loginController,
  userLogoutController,
  requireSignin,
  authMiddleware,
  adminMiddleware,
  read,
  canUpdateAndDeleteBlog,
};
