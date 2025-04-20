const mongoose = require("mongoose");
const { Schema } = mongoose;

const batchSchema = new Schema(
  {
    batchNum: {
      type: Number,
      required: true,
    },
    startingYear: {
      type: Number,
      required: true,
    },
    endingYear: {
      type: Number,
      required: true,
    },
    totalRegistered: {
      type: Number,
      default: 0,
    },
    strength: {
      type: Number,
      default: "",
    },
    branch: {
      type: String,
      default: "CSE",
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add virtual field to determine if batch is latest or previous
batchSchema.virtual("isLatest").get(function () {
  const currentYear = new Date().getFullYear();
  return this.endingYear >= currentYear;
});

module.exports = mongoose.model("Batch", batchSchema);
