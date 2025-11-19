const express = require("express");
const router = express.Router();
const Seminar = require("../models/seminarModel");
const User = require("../models/userModel");
const Batch = require("../models/batchModel");
const authorizeUser = require("../middlewares/authorizeUser");

// Helper function to check if user is from previous batch
const isPreviousBatchUser = async (userId) => {
  try {
    const user = await User.findById(userId).populate("batchId");
    if (!user || !user.batchId) return false;
    
    const batch = user.batchId;
    const currentYear = new Date().getFullYear();
    // Previous batch means endingYear < currentYear
    return batch.endingYear < currentYear;
  } catch (error) {
    console.error("Error checking batch status:", error);
    return false;
  }
};

// ROUTE 1: Get all seminars (upcoming and previous)
router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const seminars = await Seminar.find()
      .sort({ seminarDate: 1 })
      .populate("hostId", "userDetails.name profilePic.url email")
      .lean();

    // Separate into upcoming and previous
    const upcoming = seminars.filter(
      (seminar) => new Date(seminar.seminarDate) >= now
    );
    const previous = seminars.filter(
      (seminar) => new Date(seminar.seminarDate) < now
    );

    // Sort previous in descending order (most recent first)
    previous.sort(
      (a, b) => new Date(b.seminarDate) - new Date(a.seminarDate)
    );

    return res.json({
      success: true,
      upcoming,
      previous,
    });
  } catch (error) {
    console.error("Error fetching seminars:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ROUTE 2: Create a new seminar (only for previous batch users)
router.post("/create", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { title, description, seminarDate, seminarTime, link } = req.body;

    // Validate required fields
    if (!title || !seminarDate || !seminarTime || !link) {
      return res.status(400).json({
        success: false,
        message: "Title, date, time, and link are required",
      });
    }

    // Check if user is from previous batch
    const canHost = await isPreviousBatchUser(userId);
    if (!canHost) {
      return res.status(403).json({
        success: false,
        message: "Only users from previous batches can host seminars",
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Create seminar
    const seminar = new Seminar({
      hostId: userId,
      hostName: user.userDetails.name || user.email,
      title: title.trim(),
      description: description ? description.trim() : "",
      seminarDate: new Date(seminarDate),
      seminarTime: seminarTime.trim(),
      link: link.trim(),
    });

    await seminar.save();

    // Populate host details
    await seminar.populate("hostId", "userDetails.name profilePic.url email");

    return res.json({
      success: true,
      message: "Seminar created successfully",
      seminar,
    });
  } catch (error) {
    console.error("Error creating seminar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ROUTE 3: Update seminar (only by host)
router.put("/:seminarId", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { seminarId } = req.params;
    const { title, description, seminarDate, seminarTime, link } = req.body;

    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      return res.status(404).json({
        success: false,
        message: "Seminar not found",
      });
    }

    // Check if user is the host
    if (String(seminar.hostId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the host can update this seminar",
      });
    }

    // Update fields
    if (title) seminar.title = title.trim();
    if (description !== undefined) seminar.description = description.trim();
    if (seminarDate) seminar.seminarDate = new Date(seminarDate);
    if (seminarTime) seminar.seminarTime = seminarTime.trim();
    if (link) seminar.link = link.trim();

    await seminar.save();
    await seminar.populate("hostId", "userDetails.name profilePic.url email");

    return res.json({
      success: true,
      message: "Seminar updated successfully",
      seminar,
    });
  } catch (error) {
    console.error("Error updating seminar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ROUTE 4: Delete seminar (only by host)
router.delete("/:seminarId", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { seminarId } = req.params;

    const seminar = await Seminar.findById(seminarId);
    if (!seminar) {
      return res.status(404).json({
        success: false,
        message: "Seminar not found",
      });
    }

    // Check if user is the host
    if (String(seminar.hostId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Only the host can delete this seminar",
      });
    }

    await Seminar.findByIdAndDelete(seminarId);

    return res.json({
      success: true,
      message: "Seminar deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting seminar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// ROUTE 5: Check if user can host seminars
router.get("/canHost", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const canHost = await isPreviousBatchUser(userId);
    return res.json({
      success: true,
      canHost,
    });
  } catch (error) {
    console.error("Error checking host status:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;

