const express = require("express");
const router = express.Router();
const authorizeUser = require("../middlewares/authorizeUser");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const admin = require("firebase-admin");

// Initialize Firebase Admin if not already initialized
let bucket;
if (admin.apps.length) {
  try {
    bucket = admin.storage().bucket();
    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using existing Firebase Admin SDK instance in postRoutes.js"
      );
    }
  } catch (error) {
    console.error("Error getting Firebase bucket in postRoutes.js:", error);
  }
}

// Helper function to extract file path from Firebase URL
const extractFilePathFromUrl = (url) => {
  try {
    if (!url || typeof url !== "string") {
      console.error("Invalid URL passed to extractFilePathFromUrl:", url);
      return null;
    }

    // Check if the URL is a Firebase Storage URL
    if (!url.includes("firebasestorage.googleapis.com")) {
      console.error("Not a Firebase Storage URL:", url);
      return null;
    }

    // Extract the path from various Firebase URL formats

    // Format 1: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[encoded_path]?alt=media&token=[token]
    if (url.includes("/o/")) {
      const pathStartIndex = url.indexOf("/o/") + 3;
      const pathEndIndex = url.indexOf("?", pathStartIndex);

      if (pathEndIndex !== -1) {
        const encodedPath = url.substring(pathStartIndex, pathEndIndex);
        // Firebase encodes paths with %2F instead of /
        return decodeURIComponent(encodedPath);
      }
    }

    // Format 2: https://storage.googleapis.com/[bucket]/[path]
    if (url.includes("storage.googleapis.com")) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      // Remove the first empty segment and the bucket name
      pathParts.splice(0, 2);
      return pathParts.join("/");
    }

    console.error("Could not extract path from Firebase URL:", url);
    return null;
  } catch (error) {
    console.error("Error extracting file path:", error);
    return null;
  }
};

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

    // Check if media URL is from Firebase Storage
    if (
      media &&
      typeof media === "string" &&
      !media.includes("firebasestorage.googleapis.com")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid media URL format",
      });
    }

    // Delete old media file if changed or removed
    if (post.media && post.media !== media && bucket) {
      try {
        const filePath = extractFilePathFromUrl(post.media);
        if (filePath) {
          await bucket.file(filePath).delete();
          console.log(`Old post media file deleted from Firebase: ${filePath}`);
        }
      } catch (fileError) {
        console.error(
          "Error deleting old media file from Firebase:",
          fileError
        );
        // Continue with post update even if file deletion fails
      }
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

    // Delete the media file from Firebase if it exists
    if (post.media && bucket) {
      try {
        const filePath = extractFilePathFromUrl(post.media);
        if (filePath) {
          const file = bucket.file(filePath);
          const [exists] = await file.exists();

          if (exists) {
            await file.delete();
          }
        }
      } catch (fileError) {
        // Silently continue with post deletion even if file deletion fails
      }
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    // Only log errors in development mode
    if (process.env.NODE_ENV === "development") {
      console.error("Delete post error:", error);
    }
    return res.status(500).json({
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
