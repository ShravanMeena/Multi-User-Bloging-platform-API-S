import slugify from "slugify";
import Tag from "../models/tagModel.js";

export const createTag = (req, res) => {
  const { name } = req.body;

  let slug = slugify(name).toLowerCase();

  let newTag = new Tag({ name, slug });
  newTag.save((err, data) => {
    if (err) {
      return res.status(400).json({ error: err });
    }
    res.status(200).json(data);
  });
};

export const listAllTag = (req, res) => {
  Tag.find({}).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "No category found" });
    }

    return res.status(200).json(data);
  });
};

export const singleTag = (req, res) => {
  let slug = req.params.slug;
  Tag.findOne({ slug }).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "No category found" });
    }

    return res.status(200).json(data);
  });
};

export const deleteTag = (req, res) => {
  let slug = req.params.slug;
  Tag.findOneAndDelete({ slug }).exec((err, data) => {
    if (err || !data) {
      return res.status(400).json({ error: "No tag found" });
    }

    return res.status(200).json({
      messsage: "Tag deleted succesfully!",
    });
  });
};
