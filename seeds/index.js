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
  // await Blog.deleteMany({});
  // await User.deleteMany({});
  // await Comment.deleteMany({});
  // const blogs = [
  //   {
  //     title: "How to Successfully Make a Career Switch into AI",
  //     content:
  //       "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facilis debitis a dolorum eius, delectus distinctio excepturi doloremque omnis vero culpa optio eaque deleniti vel reprehenderit veniam voluptatibus obcaecati quidem molestiae.",
  //     image:
  //       "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
  //   },
  //   {
  //     title: "The art of teleportation",
  //     content:
  //       "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi asperiores deleniti magnam repellendus accusamus eos sapiente similique, ducimus, facere reiciendis, dolores corporis blanditiis? Aspernatur atque soluta provident eum, quibusdam nobis.",
  //     image:
  //       "https://plus.unsplash.com/premium_photo-1679082048495-4bc40f9d1a92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
  //   },
  // ];
  // await Blog.insertMany(blogs);
};

seedDB()
  .then(() => db.close())
  .catch((err) => console.log("Error:", err.message));
