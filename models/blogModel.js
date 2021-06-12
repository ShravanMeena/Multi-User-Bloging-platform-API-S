import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      min: 3,
      max: 160,
      required: true,
    },
    slug: {
      type: String,
      trim: true,
      unique: true,
    },
    body: {
      type: {},
      required: true,
      min: 5,
      max: 2000000,
    },
    excerpt: {
      type: String,
      max: 1000,
    },
    meta_title: {
      type: String,
    },
    meta_description: {
      type: String,
    },

    photo: {
      data: Buffer,
      contentType: String,
    },
    categories: [{ type: ObjectId, ref: "Category" }],
    tags: [{ type: ObjectId, ref: "Tag" }],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", blogSchema);
