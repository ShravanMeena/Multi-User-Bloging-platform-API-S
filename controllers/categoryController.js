import slugify from "slugify";
import Category from "../models/categoryModel.js";

export const createCategory = (req, res) => {
  const { name } = req.body;

  let slug = slugify(name).toLowerCase();

  let newCategory = new Category({ name, slug });
  newCategory.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    res.status(200).json(data);
  });
};

export const listAllCategory = (req, res) => {
  Category.find({}).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "No category found" });
    }

    return res.status(200).json(data);
  });
};

export const singleCategory = (req, res) => {
  let slug = req.params.slug;
  Category.findOne({ slug }).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "No category found" });
    }

    return res.status(200).json(data);
  });
};

export const deleteCategory = (req, res) => {
  let slug = req.params.slug;
  Category.findOneAndDelete({ slug }).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "No category found" });
    }

    return res.status(200).json({
      messsage: "Category deleted succesfully!",
    });
  });
};
