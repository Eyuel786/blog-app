const mongoose = require("mongoose");
const Blog = require("../models/Blog");
const User = require("../models/User");
const Comment = require("../models/Comment");

mongoose
  .connect("mongodb://127.0.0.1:27017/blog-app")
  .catch(() => console.error.bind(console, "Initial DB connection error:"));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "DB connection error:"));

db.once("open", console.error.bind(console, "Initial DB connection error:"));

const seedDB = async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});
  await Comment.deleteMany({});
};

seedDB()
  .then(() => db.close())
  .catch((err) => console.log("Error:", err.message));
