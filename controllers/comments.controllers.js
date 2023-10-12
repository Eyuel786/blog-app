const Blog = require("../models/Blog");
const Comment = require("../models/Comment");

module.exports.renderCommentForm = async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate({
      path: "author",
      select: "username email image",
    })
    .populate({
      path: "comments",
      populate: {
        path: "author",
        model: "User",
        select: "username email image",
      },
    });
  res.render("blogs/show", { blog, allowComment: true });
};

module.exports.createComment = async (req, res) => {
  const blogId = req.params.id;
  const blog = await Blog.findById(blogId);
  const comment = new Comment(req.body.comment);
  comment.author = req.user;
  blog.comments.push(comment);
  await Promise.all([blog.save(), comment.save()]);
  req.flash("success", "Successfully created comment");
  res.redirect(`/blogs/${blogId}`);
};

module.exports.deleteComment = async (req, res) => {
  const { id: blogId, commentId } = req.params;
  await Blog.findByIdAndUpdate(
    blogId,
    { $pull: { comments: commentId } },
    { new: true, runValidators: true }
  );
  await Comment.findByIdAndDelete(commentId);
  req.flash("success", "Successfully deleted comment");
  res.redirect(`/blogs/${blogId}`);
};
