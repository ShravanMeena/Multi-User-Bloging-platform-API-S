import User from "../models/userModel.js";
import Blog from "../models/blogModel.js";

import formidable from "formidable";
import _ from "lodash";
import fs from "fs";

export const publicProfile = (req, res) => {
  let username = req.params.username;
  let user;
  User.findOne({ username }).exec((err, userFromDb) => {
    if (err || !userFromDb) {
      return res.status(400).json({ error: "User not found" });
    }

    user = userFromDb;

    let userId = user._id;

    // find blogs create by this user
    Blog.find({ postedBy: userId })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name slug")
      .limit(10)
      .select(
        "_id title slug excerpt categories tags postedBy createdAt updatedAt"
      )
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({ error: err });
        }
        res.json({ user, blogs: data });
      });
  });
};

export const userUpdate = (req, res) => {
  let form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Image could not be uploaded" });
    }

    //   because we use auth middleware and in this middlware we save user as a req.profile
    let user = req.profile;
    // user = _.extend(user, fields);
    user = _.merge(user, fields);

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({ error: "Image should be less than 1mb" });
      }
    }

    user.photo.data = fs.readFileSync(files.photo.path);
    user.photo.contentType = files.photo.type;

    user.save((err, result) => {
      if (err) {
        return res.status(400).json({ error: "Image could not be uploaded" });
      }

      user.hashed_password = undefined;
      res.json(result);
    });
  });
};

// get blog photo in contnet type
export const photoOfUser = (req, res) => {
  let username = req.params.username;
  User.findOne({ username }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    res.set("Content-Type", user.photo.contentType);
    console.log(user);
    res.send(user.photo.data);
  });
};
