require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const Post = require("../models/postModel");
const admin = require("firebase-admin");

const authorizeUser = require("../middlewares/authorizeUser");

router.post("/createNewPost", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      postType,
      postUrl,
      postTitle,
      postDescription,
      timeStamp,
      docGivenName,
    } = req.body;
    if (!postType || !postUrl || !postTitle || !timeStamp || !docGivenName) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid credentials # There must be postType, postTitle, postUrl, timestamp, docGivenName in req.body",
      });
    }
    const newPost = new Post({
      postType,
      authorId: userId,
      createdAt: timeStamp,
      postDetails: {
        docGivenName,
        url: postUrl,
        title: postTitle,
        description: postDescription,
      },
    });
    await newPost.save();

    return res.json({
      success: true,
      message: "New post created.",
      data: {
        post: newPost,
      },
    });
  } catch (error) {
    console.log("Some error in creating new post : ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/fetchPosts", authorizeUser, async (req, res) => {
  try {
    const { postType } = req.query;
    if (!postType) {
      return res.status(401).json({
        success: false,
        message: "Not post type provided in query",
      });
    }
    const findPosts = await Post.find({ postType: "gallery" });

    return res.json({
      success: true,
      message: `All ${postType} posts sent`,
      data: {
        postsLength: findPosts.length,
        posts: findPosts.reverse(),
      },
    });
  } catch (error) {
    console.log("Some error in fetching post : ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/deletePost", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { postId, postYear, givenName } = req.query;

    // Set JSON content type
    res.setHeader("Content-Type", "application/json");

    // First check if user exists and is admin
    const user = await User.findById(userId);
    if (!user || user.isSpecialUser !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Only admins can delete posts",
      });
    }

    // Validate required parameters
    if (!postId || !postYear || !givenName) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: postId, postYear, and givenName are required",
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Log the deletion attempt
    console.log("Attempting to delete post:", {
      postId,
      postYear,
      givenName,
      fileName: post.postDetails.docGivenName,
      url: post.postDetails.url,
    });

    // Delete from Firebase storage
    try {
      const bucket = admin.storage().bucket();
      // Extract filename from URL
      const urlParts = post.postDetails.url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `gallery/${postYear}/${givenName}/${fileName}`;

      console.log("Deleting file from path:", filePath);

      await bucket.file(filePath).delete();
    } catch (firebaseError) {
      console.error("Firebase deletion error:", firebaseError);
      // Continue with database deletion even if Firebase deletion fails
    }

    // Delete from database
    await Post.findByIdAndDelete(postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting post",
    });
  }
});

module.exports = router;

/*

Group_Admin_Tue Nov 21 2023 17:54:47 GMT+0530 (India Standard Time)_g6afuD
Group_Admin_Tue Nov 21 2023 17:54:47 GMT 0530 (India Standard Time)_g6afuD
Group_Admin_Tue Nov 21 2023 17:54:47 GMT+0530 (India Standard Time)_g6afuD

*/
