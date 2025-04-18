const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Interview Experience",
      "Job Posting",
      "General",
      "Project Showcase",
      "Academic Query",
    ],
    default: "General",
  },
  media: {
    type: String, // URL to media file (image/video)
    default: null,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
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
postSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
