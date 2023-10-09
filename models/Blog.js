const { Schema, model } = require("mongoose");

const blogSchema = new Schema(
  {
    title: String,
    subtitle: String,
    content: String,
    image: String,
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = model("Blog", blogSchema);
