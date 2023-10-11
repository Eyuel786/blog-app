const { Schema, model } = require("mongoose");
const Comment = require("./Comment");

const blogSchema = new Schema(
  {
    title: String,
    subtitle: String,
    content: String,
    image: String,
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

blogSchema.post("findOneAndDelete", async (blog) => {
  try {
    if (blog.comments.length > 0) {
      await Promise.all(
        blog.comments.map((comment) => Comment.findByIdAndDelete(comment))
      );
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
});

module.exports = model("Blog", blogSchema);
