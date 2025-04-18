const express = require("express");
const router = express.Router();
const authorizeUser = require("../middlewares/authorizeUser");
const Post = require("../models/postModel");
const User = require("../models/userModel");

// Create a new post
router.post("/create", authorizeUser, async (req, res) => {
  try {
    const { content, category, media } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    const newPost = new Post({
      userId,
      content: content.trim(),
      category: category || "General",
      media,
    });

    await newPost.save();

    // Populate user details for the response
    const populatedPost = await Post.findById(newPost._id)
      .populate("userId", "userDetails.name profilePic.url")
      .populate("likes", "userDetails.name")
      .populate("comments.userId", "userDetails.name");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating post",
      error: error.message,
    });
  }
});

// Update a post
router.put("/:postId", authorizeUser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;
    const { content, category, media } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user is the owner of the post
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this post",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    post.content = content.trim();
    if (category) post.category = category;
    if (media !== undefined) post.media = media;

    await post.save();

    // Populate user details for the response
    const updatedPost = await Post.findById(postId)
      .populate("userId", "userDetails.name profilePic.url")
      .populate("likes", "userDetails.name")
      .populate("comments.userId", "userDetails.name");

    res.json({
      success: true,
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating post",
      error: error.message,
    });
  }
});

// Get feed posts (posts from users you follow)
router.get("/feed", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get posts from users you follow and your own posts
    const posts = await Post.find({
      $or: [
        { userId: { $in: user.following } },
        { userId: userId }, // Include user's own posts
      ],
    })
      .sort({ createdAt: -1 })
      .populate("userId", "userDetails.name profilePic.url")
      .populate("likes", "userDetails.name")
      .populate("comments.userId", "userDetails.name");

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Feed error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feed",
      error: error.message,
    });
  }
});

// Get user's posts
router.get("/user/:userId", authorizeUser, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const requestingUserId = req.userId;

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const posts = await Post.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .populate("userId", "userDetails.name profilePic.url")
      .populate("likes", "userDetails.name")
      .populate("comments.userId", "userDetails.name");

    res.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user posts",
      error: error.message,
    });
  }
});

// Delete a post
router.delete("/:postId", authorizeUser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user is the owner of the post
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting post",
      error: error.message,
    });
  }
});

// Like/unlike a post
router.post("/:postId/like", authorizeUser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(likeIndex, 1);
    }

    await post.save();

    // Populate likes for response
    const updatedPost = await Post.findById(postId).populate(
      "likes",
      "userDetails.name"
    );

    res.json({
      success: true,
      message: likeIndex === -1 ? "Post liked" : "Post unliked",
      likes: updatedPost.likes,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating like",
      error: error.message,
    });
  }
});

// Add comment to a post
router.post("/:postId/comment", authorizeUser, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    post.comments.push({
      userId,
      content: content.trim(),
    });

    await post.save();

    // Populate comments for response
    const updatedPost = await Post.findById(postId).populate(
      "comments.userId",
      "userDetails.name"
    );

    res.json({
      success: true,
      message: "Comment added successfully",
      comments: updatedPost.comments,
    });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding comment",
      error: error.message,
    });
  }
});

module.exports = router;
