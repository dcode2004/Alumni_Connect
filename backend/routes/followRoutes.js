const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const authorizeUser = require("../middlewares/authorizeUser");

// Follow a user
router.post("/follow/:userId", authorizeUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.userId);

    // Check if trying to follow self
    if (userId === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot follow yourself",
      });
    }

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already following this user",
      });
    }

    // Add to following and followers
    currentUser.following.push(userId);
    targetUser.followers.push(req.userId);

    await currentUser.save();
    await targetUser.save();

    return res.json({
      success: true,
      message: "User followed successfully",
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Unfollow a user
router.post("/unfollow/:userId", authorizeUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.userId);

    // Check if user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if actually following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Not following this user",
      });
    }

    // Remove from following and followers
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== req.userId
    );

    await currentUser.save();
    await targetUser.save();

    return res.json({
      success: true,
      message: "User unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's followers
router.get("/followers/:userId", authorizeUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "userDetails.name profilePic.url email batchNum")
      .select("followers");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      followers: user.followers,
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get user's following
router.get("/following/:userId", authorizeUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("following", "userDetails.name profilePic.url email batchNum")
      .select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      following: user.following,
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Get follow status (whether current user is following target user)
router.get("/status/:userId", authorizeUser, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const isFollowing = currentUser.following.includes(req.params.userId);

    res.json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    console.error("Get follow status error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
