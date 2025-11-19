require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const multer = require("multer");
const multerStorage = multer.memoryStorage(); // Store the uploaded image in memory
const upload = multer({ multerStorage });

const saltRounds = 10;
const Batch = require("../models/batchModel");
const {
  emailAdminNewUserRegistered,
  emailNewUser,
} = require("../helper/sendMail");

// --- firebase App setup --
const firebaseConfig = require("../firebase/firebaseConfig");
const { initializeApp } = require("firebase/app");
const app = initializeApp(firebaseConfig);
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const storage = getStorage(app);
const profileImagesRef = ref(storage, "/images/profileImages");

const adminEmail = process.env.ADMIN_NOTIFY_EMAIL; // admin will be notified when a new user gets registered
// --- to get the user email in encrypted format token
// const admin = require("firebase-admin");
// const serviceAccount = require("../firebase/firebaseAdminSdk");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

const authorizeUser = require("../middlewares/authorizeUser");
const getLocationFromIP = require("../helper/getLocationFromIP");

// Helper function to get client IP address
const getClientIP = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown"
  );
};

router.post("/createUser", upload.single("imageFile"), async (req, res) => {
  try {
    const textData = JSON.parse(req.body.textData);
    // credentials
    // need to validate credentials
    const { email, password, batch, fullName, homeState, jobDetails } =
      textData; // getting data from frontend
    // Step 1 : check if user email already exists
    const isExists = await User.findOne({ email });
    if (isExists) {
      return res.status(409).json({
        success: false,
        message: "User with same email already exists. Please login!",
      });
    } else {
      // first find that batch
      const isBatchExists = await Batch.findOne({ batchNum: batch });
      if (isBatchExists) {
        // Batch exists - Do User Registration
        // ----- USER REGISTRATION STARTS --
        // --- Hash the password ----
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        const newUser = new User({
          email,
          batchId: isBatchExists._id,
          batchNum: isBatchExists.batchNum,
          userDetails: {
            name: fullName,
            homeState,
            password: hashedPassword,
          },
          jobDetails: jobDetails || {
            company: "LNMIIT",
            role: "Student",
          },
        });
        // --- Create JWT token ---
        const data = { userId: newUser._id };
        const token = jwt.sign(data, process.env.JWT_SECRET_CODE);
        let userProfileUrl = "";
        let finalMessage = "User created!";
        // ---------- save file here -------
        if (req.file) {
          // profile pic
          const fileType = req.file.mimetype;
          const fileOriginalName = req.file.originalname;
          const bufferData = req.file.buffer;
          const now = new Date();
          const dateStamp = now.toISOString();
          const randString = randomString.generate({
            length: 12,
            charset: "alphanumeric",
          });
          const docGivenName = fileOriginalName + dateStamp + randString;
          const metaData = {
            contentType: fileType,
          };
          // ---- if user has sent profile image , first save to firebase
          if (fileType === "image/jpeg" || fileType === "image/png") {
            const uploadProfilePicRef = ref(
              profileImagesRef,
              `${batch}/${docGivenName}`
            );
            const snapShot = await uploadBytes(
              uploadProfilePicRef,
              bufferData,
              metaData
            );
            userProfileUrl = await getDownloadURL(snapShot.ref);
          }
          if (userProfileUrl === "" || userProfileUrl === "error") {
            finalMessage = "Account created but profile picture upload failed!";
          } else {
            finalMessage = "Account created & profile picture uploaded!";
            newUser.profilePic = {
              givenName: docGivenName,
              url: userProfileUrl,
            };
          }
        }
        await newUser.save();
        const userFullName = newUser.userDetails.name;
        isBatchExists.totalRegistered += 1; // isBatchExists.totalRegistered = isBatchExists.totalRegistered + 1
        await isBatchExists.save();
        // ----------- Send Email to new user ------
        const isEmailSent = await emailNewUser(newUser.email, userFullName);
        const isAdminAlerted = await emailAdminNewUserRegistered(adminEmail, {
          email: newUser.email,
          name: userFullName,
          batch: newUser.batchNum,
        });
        // ----------- Send Email to new user ------
        return res.json({
          success: true,
          message: finalMessage,
          user: newUser,
          token,
          isEmailSentToUser: isEmailSent,
          isAdminNotified: isAdminAlerted,
        });
        // ----- USER REGISTRATION Ends --
      } else {
        return res.status(404).json({
          success: false,
          message: "Batch not found!",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error! please try after some time",
      error,
    });
  }
});

// ROUTE 2 :: Login user by google Sign in
router.post("/loginViaGoogle", async (req, res) => {
  try {
    // const decodedToken = await admin.auth().verifyIdToken(req.body.uid);
    // const email = decodedToken.email; // User's email

    const { email, location } = req.body; // location from frontend (optional)
    const isExist = await User.findOne({ email });
    if (isExist) {
      // Get client IP address
      const clientIP = getClientIP(req);

      // Prepare location data
      let locationData = {
        latitude: null,
        longitude: null,
        city: "",
        state: "",
        country: "",
        ipAddress: clientIP,
      };

      // If frontend provided location (from browser geolocation)
      if (location && location.latitude && location.longitude) {
        locationData.latitude = location.latitude;
        locationData.longitude = location.longitude;
        locationData.city = location.city || "";
        locationData.state = location.state || "";
        locationData.country = location.country || "";
      } else {
        // Fallback: Get location from IP address
        const ipLocation = await getLocationFromIP(clientIP);
        locationData.city = ipLocation.city;
        locationData.state = ipLocation.state;
        locationData.country = ipLocation.country;
      }

      // Update last login information
      isExist.lastLogin = {
        timestamp: new Date(),
        location: locationData,
      };
      await isExist.save();

      // --- Create JWT token ---
      const data = { userId: isExist._id };
      const token = jwt.sign(data, process.env.JWT_SECRET_CODE);
      const user = await User.findById(isExist._id)
        .select("-userDetails.password")
        .populate("batchId");
      return res.json({
        success: true,
        message: "Signed in successfully",
        token,
        user,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "User does not exists",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Some internal server occurred! Try after some time",
    });
  }
});

// ROUTE 3 :: Login by email & password manually
router.post("/loginManually", async (req, res) => {
  try {
    const { email, password, location } = req.body; // location from frontend (optional)
    const isExist = await User.findOne({ email });
    if (isExist) {
      // verify user password
      const isPassMatched = bcrypt.compareSync(
        password,
        isExist.userDetails.password
      );
      if (isPassMatched) {
        // Get client IP address
        const clientIP = getClientIP(req);

        // Prepare location data
        let locationData = {
          latitude: null,
          longitude: null,
          city: "",
          state: "",
          country: "",
          ipAddress: clientIP,
        };

        // If frontend provided location (from browser geolocation)
        if (location && location.latitude && location.longitude) {
          locationData.latitude = location.latitude;
          locationData.longitude = location.longitude;
          locationData.city = location.city || "";
          locationData.state = location.state || "";
          locationData.country = location.country || "";
        } else {
          // Fallback: Get location from IP address
          const ipLocation = await getLocationFromIP(clientIP);
          locationData.city = ipLocation.city;
          locationData.state = ipLocation.state;
          locationData.country = ipLocation.country;
        }

        // Update last login information
        isExist.lastLogin = {
          timestamp: new Date(),
          location: locationData,
        };
        await isExist.save();

        const data = { userId: isExist._id };
        const token = jwt.sign(data, process.env.JWT_SECRET_CODE);
        const user = await User.findById(isExist._id)
          .select("-userDetails.password")
          .populate("batchId");
        res.json({
          success: true,
          message: "Signed in successfully",
          token,
          user,
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Email or password is wrong",
        });
      }
    } else {
      // user not found
      res.status(404).json({
        success: false,
        message: "User does not exists",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Some internal server occurred! Try after some time",
    });
  }
});

//ROUTE 4 :: fetch user
router.get("/fetchUser", authorizeUser, async (req, res) => {
  try {
    const userId = req.userId;
    const findUser = await User.findById(userId)
      .select("-userDetails.password")
      .populate("batchId"); // Populate the batchId field
    res.json({
      success: true,
      message: "user data sent",
      user: findUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Some internal server occurred! Try after some time",
    });
  }
});

// ROUTE :: search users (by name / email / regNum) - authorized users only
router.get("/search", authorizeUser, async (req, res) => {
  try {
    const q = req.query.q || "";
    if (!q || q.trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Query is required" });
    }
    const regex = new RegExp(q.trim(), "i");
    const users = await User.find({
      $or: [
        { "userDetails.name": regex },
        { email: regex },
        { "userDetails.regNum": regex },
      ],
    })
      .select("_id email userDetails.name batchNum profilePic isSpecialUser")
      .limit(50);

    return res.json({ success: true, users });
  } catch (error) {
    console.error("Error in user search:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

// ROUTE :: get public user info by id (authorized)
router.get("/getById/:userId", authorizeUser, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId is required" });
    }
    const user = await User.findById(userId).select(
      "_id email userDetails.name profilePic.url batchNum"
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
