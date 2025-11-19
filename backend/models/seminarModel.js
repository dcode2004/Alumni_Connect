const mongoose = require("mongoose");
const { Schema } = mongoose;

const seminarSchema = new Schema({
  hostId: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
  },
  hostName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  seminarDate: {
    type: Date,
    required: true,
  },
  seminarTime: {
    type: String,
    required: true, // e.g., "10:00 AM - 11:30 AM"
  },
  link: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
seminarSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient querying by date
seminarSchema.index({ seminarDate: 1 });

module.exports = mongoose.model("Seminar", seminarSchema);

