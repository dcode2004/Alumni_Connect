const express = require("express");
const router = express.Router();
const Gallery = require("../models/galleryModel");
const User = require("../models/userModel");
const authorizeUser = require("../middlewares/authorizeUser");
const admin = require("firebase-admin");
const multer = require("multer");

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    type: process.env.FIREBASE_ADMIN_ACC_TYPE,
    project_id: process.env.FIREBASE_ADMIN_PROJ_ID,
    private_key_id: process.env.FIREBASE_ADMIN_PRVT_KEY_ID,
    private_key: process.env.FIREBASE_ADMIN_PRVT_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_ADMIN_CLIENT_ID,
    auth_uri: process.env.FIREBASE_ADMIN_AUTH_URI,
    token_uri: process.env.FIREBASE_ADMIN_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_ADMIN_AUTH_PROVIDER,
    client_x509_cert_url: process.env.FIREBASE_ADMIN_CLIENT_CERT_URL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGEBUCKET,
  });
}

const bucket = admin.storage().bucket();

// Upload gallery image
router.post(
  "/upload",
  authorizeUser,
  upload.single("image"),
  async (req, res) => {
    try {
      const userId = req.userId;
      const { postTitle, postDescription, postYear } = req.body;

      // Check if user is admin
      const user = await User.findById(userId);
      if (user.isSpecialUser !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only admins can upload gallery images",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      const filename = `${postTitle.replace(/ /g, "_")}_${timestamp}_${random}`;
      const filePath = `images/gallery/${postYear}/${filename}`;

      // Create a new blob in the bucket
      const blob = bucket.file(filePath);
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
          cacheControl: "public, max-age=31536000",
        },
        resumable: false,
      });

      // Handle errors during upload
      const uploadPromise = new Promise((resolve, reject) => {
        blobStream.on("error", (error) => {
          console.error("Upload error:", error);
          reject(error);
        });

        blobStream.on("finish", async () => {
          // Make the file public
          try {
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
            resolve(publicUrl);
          } catch (error) {
            console.error("Make public error:", error);
            reject(error);
          }
        });

        // Write the file
        blobStream.end(req.file.buffer);
      });

      const downloadUrl = await uploadPromise;

      // Create new gallery image
      const newGalleryImage = new Gallery({
        userId: userId,
        title: postTitle,
        description: postDescription || "",
        url: downloadUrl,
        docGivenName: filename,
      });

      await newGalleryImage.save();

      // Populate user details for the response
      const populatedImage = await Gallery.findById(
        newGalleryImage._id
      ).populate("userId", "userDetails.name");

      return res.json({
        success: true,
        message: "Gallery image uploaded successfully",
        data: {
          post: populatedImage,
        },
      });
    } catch (error) {
      console.error("Gallery upload error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload gallery image",
        error: error.message,
      });
    }
  }
);

// Fetch gallery images
router.get("/fetch", authorizeUser, async (req, res) => {
  try {
    // Find images and populate user details
    const images = await Gallery.find()
      .populate("userId", "userDetails.name")
      .sort({ createdAt: -1 }); // Sort by newest first

    return res.json({
      success: true,
      message: "Gallery images fetched successfully",
      data: {
        postsLength: images.length,
        posts: images,
      },
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch gallery images",
      error: error.message,
    });
  }
});

// Delete gallery image
router.delete("/delete/:imageId", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { imageId } = req.params;
    const { postYear } = req.query;

    // Check if user is admin
    const user = await User.findById(userId);
    if (user.isSpecialUser !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete gallery images",
      });
    }

    const image = await Gallery.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Delete from Firebase storage
    const filePath = `images/gallery/${postYear}/${image.docGivenName}`;
    await bucket.file(filePath).delete();

    // Delete from database
    await Gallery.findByIdAndDelete(imageId);

    return res.json({
      success: true,
      message: "Gallery image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete gallery image",
      error: error.message,
    });
  }
});

module.exports = router;
