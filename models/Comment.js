const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
    comment: String,
    author: { type: Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = model("Comment", commentSchema);
