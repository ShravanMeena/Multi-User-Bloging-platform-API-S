import express from "express";
import {
  requireSignin,
  adminMiddleware,
  authMiddleware,
  canUpdateAndDeleteBlog,
} from "../controllers/authController.js";
import {
  createBlog,
  listBlogs,
  listAllBlogsCategoriesAndTags,
  readBlog,
  deleteBlog,
  updateBlog,
  photoOfBlog,
  listRelatedBlogs,
  listSearchBlogs,
  listBlogsByUser,
} from "../controllers/blogController.js";
const router = express.Router();

router.post("/blog", requireSignin, adminMiddleware, createBlog);
router.get("/blogs", listBlogs);
router.post("/blogs-categories-and-tags", listAllBlogsCategoriesAndTags);
router.get("/blog/:slug", requireSignin, adminMiddleware, readBlog);
router.delete("/blog/:slug", requireSignin, adminMiddleware, deleteBlog);
router.put("/blog/:slug", requireSignin, adminMiddleware, updateBlog);
router.get("/blog/photo/:slug", photoOfBlog);
router.post("/blogs/related", listRelatedBlogs);
router.get("/blogs/search", listSearchBlogs);

// regular user can create a blog
router.post("/user/blog", requireSignin, authMiddleware, createBlog);
router.delete(
  "/user/blog/:slug",
  requireSignin,
  authMiddleware,
  canUpdateAndDeleteBlog,
  deleteBlog
);
router.put(
  "/user/blog/:slug",
  requireSignin,
  authMiddleware,
  canUpdateAndDeleteBlog,
  updateBlog
);
router.get("/:username/blogs", listBlogsByUser);

export default router;
