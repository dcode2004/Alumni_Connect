const express = require("express");
const router = express.Router();
const authorizeUser = require("../middlewares/authorizeUser");
const User = require("../models/userModel");
const admin = require("firebase-admin");
const {
  getStorage,
  ref,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const { initializeApp } = require("firebase/app");
const firebaseConfig = require("../firebase/firebaseConfig");
const firebaseAdminConfig = require("../firebase/firebaseAdminSdk");

// Initialize client-side Firebase for uploads
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Ensure Firebase Admin is initialized (for deleting files)
let bucket;
// Use existing Firebase Admin SDK if already initialized
if (admin.apps.length) {
  try {
    bucket = admin.storage().bucket();
    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Using existing Firebase Admin SDK instance in userProfileEdit.js"
      );
    }
  } catch (error) {
    console.error(
      "Error getting Firebase bucket in userProfileEdit.js:",
      error
    );
  }
}

// Helper function to extract file path from Firebase URL (same as in postRoutes.js)
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

// Delete profile picture
router.delete("/profilePicture", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { sameUser, editingUserId } = req.query;

    // Determine which user ID to use (for admin operations)
    const targetUserId =
      sameUser === "false" && editingUserId ? editingUserId : userId;

    const findUser = await User.findById(targetUserId);

    if (!findUser) {
      return res.status(404).json({
        success: false,
        message: "User not found #",
      });
    }

    // If no profile picture, nothing to delete
    if (!findUser.profilePic || !findUser.profilePic.url) {
      findUser.profilePic = { url: "", givenName: "" };
      await findUser.save();
      return res.json({
        success: true,
        message: "No profile picture to delete #",
      });
    }

    const profilePicUrl = findUser.profilePic.url;

    // Try to delete from Firebase using Admin SDK (if available)
    if (bucket) {
      try {
        const filePath = extractFilePathFromUrl(profilePicUrl);

        if (filePath) {
          const file = bucket.file(filePath);

          // First check if file exists
          const [exists] = await file.exists();

          if (exists) {
            await file.delete();
          }
        }
      } catch (deleteError) {
        // Silently continue with profile update even if file deletion fails
      }
    }

    // Update user profile in database regardless of file deletion success
    findUser.profilePic = { url: "", givenName: "" };
    await findUser.save();

    return res.json({
      success: true,
      message: "Profile picture deleted successfully #",
    });
  } catch (error) {
    // Only log errors in development mode
    if (process.env.NODE_ENV === "development") {
      console.error("Error in deleting profile picture:", error);
    }
    return res.status(500).json({
      success: false,
      message: "Some error occurred # internal server",
    });
  }
});

// update profile picture
router.put("/profilePicture", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { url, givenName } = req.body;
    if (!url || !givenName) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials #",
      });
    }
    const findUser = await User.findById(userId);
    findUser.profilePic = {
      url,
      givenName,
    };
    await findUser.save();
    return res.json({
      success: true,
      message: "Profile picture updated successfully. #",
    });
  } catch (error) {
    console.log("There is some error in updating profile picture ", error);
    return res.status(505).json({
      success: false,
      message: "Some error occurred # internal server",
    });
  }
});

// To update graduation course
router.put("/gradCourse", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { gradCourse } = req.body;
    if (!gradCourse) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials. #",
      });
    }
    const findUser = await User.findById(userId);
    findUser.userDetails.gradCourse = gradCourse;
    await findUser.save();

    return res.json({
      success: true,
      message: "Graduation updated successfully. #",
    });
  } catch (error) {
    console.log("There is some error in updating profile picture ", error);
    return res.status(505).json({
      success: false,
      message: "Some error occurred # internal server",
    });
  }
});

// to update field of interest
router.put("/fieldOfInterest", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { fieldOfInterest } = req.body;
    if (!fieldOfInterest) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials. #",
      });
    }
    const findUser = await User.findById(userId);
    findUser.fieldOfInterest = fieldOfInterest;
    await findUser.save();

    return res.json({
      success: true,
      message: "Field of interest updated successfully. #",
    });
  } catch (error) {
    console.log("There is some error in updating filed of interest ", error);
    return res.status(505).json({
      success: false,
      message: "Some error occurred # internal server",
    });
  }
});

router.put("/socialLinks", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { socialLinks } = req.body;
    if (!socialLinks) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials. #",
      });
    }
    const { githubLink, linkedInLink } = socialLinks;
    const findUser = await User.findById(userId);
    findUser.userDetails.socialLinks = {
      githubLink,
      linkedInLink,
    };
    await findUser.save();

    return res.json({
      success: true,
      message: "Field of interest updated successfully. #",
    });
  } catch (error) {
    console.log("There is some error in updating filed of interest ", error);
    return res.status(505).json({
      success: false,
      message: "Some error occurred # internal server",
    });
  }
});

// Update job details
router.put("/jobDetails", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { company, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update job details
    user.jobDetails.company = company;
    user.jobDetails.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "Job details updated successfully",
      jobDetails: user.jobDetails,
    });
  } catch (error) {
    console.log("Error in updating job details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Update current location
router.put("/location", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { city, state, country } = req.body;

    if (!city || !state || !country) {
      return res.status(400).json({
        success: false,
        message: "City, state, and country are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update location in lastLogin (preserve timestamp and other data)
    if (!user.lastLogin) {
      user.lastLogin = {
        timestamp: new Date(),
        location: {
          latitude: null,
          longitude: null,
          city: "",
          state: "",
          country: "",
          ipAddress: "",
        },
      };
    }

    user.lastLogin.location.city = city;
    user.lastLogin.location.state = state;
    user.lastLogin.location.country = country;
    // Keep existing latitude, longitude, and ipAddress if they exist

    await user.save();

    return res.json({
      success: true,
      message: "Location updated successfully",
      location: user.lastLogin.location,
    });
  } catch (error) {
    console.log("Error in updating location:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
