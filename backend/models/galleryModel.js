const mongoose = require("mongoose");
const { Schema } = mongoose;

const gallerySchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  url: {
    type: String,
    required: true,
  },
  docGivenName: {
    type: String,
    required: true,
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
gallerySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
