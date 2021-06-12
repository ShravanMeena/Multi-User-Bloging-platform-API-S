import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import colors from "colors";
import mongoose from "mongoose";

import dotenv from "dotenv";
dotenv.config();

// routes
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import tagRoutes from "./routes/tagRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// app
const app = express();

// middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

// cors
if (process.env.NODE_ENV === "development") {
  app.use(cors({ origin: process.env.CLIENT_URL }));
}

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: true,
  })
  .then(() => console.log("Database connected".yellow))
  .catch((err) => {
    console.log("Database connection error".bgRed, err);
  });

// routes middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", tagRoutes);
app.use("/api", blogRoutes);

// port
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`.rainbow.underline.bold);
});
