import Blog from "../models/blogModel.js";
import Category from "../models/categoryModel.js";
import User from "../models/userModel.js";
import Tag from "../models/tagModel.js";
import formidable from "formidable";
import slugify from "slugify";
import _ from "lodash";
import fs from "fs";

// create a new blog
export const createBlog = (req, res) => {
  let form = formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Image could not be uploaded",
      });
    }
    const { title, body, categories, tags } = fields;

    //  validation
    if (!title) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    if (!body || body.length < 200) {
      return res.status(400).json({
        error: "Content is too short",
      });
    }

    if (!categories || categories.length === 0) {
      return res.status(400).json({
        error: "At least one category is required",
      });
    }

    if (!tags || tags.length === 0) {
      return res.status(400).json({
        error: "At least one tag is required",
      });
    }

    let blog = new Blog();

    blog.title = title;
    blog.body = body;
    blog.slug = slugify(title).toLowerCase();
    blog.meta_title = `${title} | ${process.env.APP_NAME}`;
    blog.meta_description = body.substring(0, 160);
    blog.postedBy = req.user._id;

    // handling of categories and tags
    let arrayOfCategories = categories && categories.split(",");
    let arrayOfTags = tags && tags.split(",");

    if (files.photo) {
      if (files.photo.size > 10000000) {
        return res.status(400).json({
          error: "Image could not be uploaded",
        });
      }

      blog.photo.data = fs.readFileSync(files.photo.path);
      blog.photo.contentType = files.photo.type;

      blog.save((err, result) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        // update categories of blog
        Blog.findByIdAndUpdate(
          result._id,
          { $push: { categories: arrayOfCategories } },
          { new: true }
        ).exec((err, result) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          } else {
            Blog.findByIdAndUpdate(
              result._id,
              { $push: { tags: arrayOfTags } },
              { new: true }
            ).exec((err, result) => {
              if (err) {
                return res.status(400).json({
                  error: err,
                });
              }

              res.json(result);
            });
          }
        });
      });
    }
  });
};

// list of all create  blogs
export const listBlogs = (req, res) => {
  Blog.find({})
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name slug")
    .select(
      "_id title slug excerpt categories tags postedBy createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      res.json(data);
    });
};

// list of all blogs,categories,tags
export const listAllBlogsCategoriesAndTags = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  let blogs;
  let categories;
  let tags;

  Blog.find({})
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username profile")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt categories tags postedBy createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      blogs = data;

      //   get all categories
      Category.find({}).exec((err, cat) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        categories = cat;

        //  get all tags

        Tag.find({}).exec((err, tg) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }
          tags = tg;

          //   return all blogs categiries and tags
          res.json({ blogs, categories, tags, size: blogs.length });
        });
      });
    });
};

// get details about a single blog by slug
export const readBlog = (req, res) => {
  let slug = req.params.slug;
  Blog.findOne({ slug })
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name slug")
    .select("_id title slug  categories tags postedBy createdAt updatedAt")
    .exec((err, data) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      res.json(data);
    });
};

// delet user by slug
export const deleteBlog = (req, res) => {
  let slug = req.params.slug;
  Blog.findOneAndDelete({ slug }).exec((err, data) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    res.json({ message: "Blog deleted succesfuly!" });
  });
};

// update create user by slug
export const updateBlog = (req, res) => {
  const slug = req.params.slug;

  Blog.findOne({ slug }).exec((err, oldBlog) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    let form = formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          error: "Image could not be uploaded",
        });
      }

      let slugBeforeMerge = oldBlog.slug;
      oldBlog = _.merge(oldBlog, fields);
      oldBlog.slug = slugBeforeMerge;

      const { body, categories, tags } = fields;

      if (body) {
        oldBlog.meta_description = body.substring(0, 160);
      }

      if (categories) {
        oldBlog.categories = categories.split(",");
      }

      if (tags) {
        oldBlog.tags = tags.split(",");
      }

      if (files.photo) {
        if (files.photo.size > 10000000) {
          return res.status(400).json({
            error: "Image could not be uploaded",
          });
        }

        oldBlog.photo.data = fs.readFileSync(files.photo.path);
        oldBlog.photo.contentType = files.photo.type;

        oldBlog.save((err, result) => {
          if (err) {
            return res.status(400).json({
              error: err,
            });
          }

          res.json(result);
        });
      }
    });
  });
};

// get blog photo in contnet type
export const photoOfBlog = (req, res) => {
  let slug = req.params.slug;
  Blog.findOne({ slug })
    .select("photo")
    .exec((err, blog) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      res.set("Content-Type", blog.photo.contentType);

      res.send(blog.photo.data);
    });
};

// get alll related blogs wit ne: not enclude and ni: include
export const listRelatedBlogs = (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 3;
  let { _id, categories } = req.body.blog;
  Blog.findOne({ _id: { $ne: _id }, categories: { $in: categories } })
    .limit(limit)
    .populate("postedBy", "_id name profile")
    .select("_id title slug  categories tags postedBy createdAt updatedAt")
    .exec((err, blogs) => {
      if (err) {
        return res.status(400).json({
          error: err,
        });
      }

      res.json({ blogs });
    });
};

// search products
export const listSearchBlogs = (req, res) => {
  const { search } = req.body;

  if (search) {
    Blog.find(
      {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { body: { $regex: search, $options: "i" } },
        ],
      },
      (err, blogs) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }
        res.json(blogs);
      }
    ).select("-photo -body");
  }
};

export const listBlogsByUser = (req, res) => {
  let username = req.params.username;
  User.findOne({ username }).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: err,
      });
    }

    let userId = user._id;
    Blog.find({ postedBy: userId })
      .populate("categories", "_id name slug")
      .populate("tags", "_id name slug")
      .populate("postedBy", "_id name slug")
      .select("_id title slug  categories tags postedBy createdAt updatedAt")
      .exec((err, data) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        res.json(data);
      });
  });
};
