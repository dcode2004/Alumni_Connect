const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../../models/userModel");

const migrateUsers = async () => {
  try {
    if (!process.env.MONGO_DB_URL) {
      throw new Error("MONGO_DB_URL is not defined in .env file");
    }

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Connected to MongoDB successfully");

    // Find all users and update them
    console.log("Updating users...");
    const result = await User.updateMany(
      {},
      {
        $set: {
          following: [],
          followers: [],
        },
      },
      { multi: true }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Updated ${result.modifiedCount} users`);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("Database connection closed");
    }
  }
};

// Run the migration
migrateUsers();
