require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const connectToDatabase = require("./database/database");
const userRoutes = require("./routes/userRoutes");
const userProfileEdit = require("./routes/userProfileEdit");
const postRoutes = require("./routes/postRoutes");
const galleryRoutes = require("./routes/galleryRoute");
const batchRoutes = require("./routes/batchRoutes");
const followRoutes = require("./routes/followRoutes");

// -------- DATA BASE CONNECTION -----------
// use async/await to wait for the connection
(async () => {
  try {
    await connectToDatabase(); // here database is connection takes place & a default admin user is created
    // start the server after the connection is ready
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Server started in the port ${port}. :) Happy coding`);
    });
  } catch (error) {
    console.log("Unable to connect database ");
  }
})();

// ---------- MIDDLEWARE ------------
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.json());

const homeResponseData = {
  response: "Welcome to LNMIIT server.",
};

// -------- ALL ROUTES ----------------
app.use("/api/user", userRoutes);
app.use("/api/user/editProfile", userProfileEdit);
app.use("/api/posts", postRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/seminar", require("./routes/seminarRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));
app.use("/api/coordinators/", require("./routes/coordinators"));
app.use("/api/accounts", require("./routes/adminRoutes")); // fetches all users account for admin page

// ---- HOME ROUTE -----
app.get("/", (req, res) => {
  res.json(homeResponseData);
});
