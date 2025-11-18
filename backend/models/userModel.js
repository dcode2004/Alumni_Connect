const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  batchId: {
    type: Schema.ObjectId,
    ref: "Batch",
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  batchNum: {
    type: Number,
  },
  userType: {
    type: String,
    default: "user",
  },
  isSpecialUser: {
    type: String,
    default: "", //place "admin" for who maintains website
  },
  status: {
    type: Number,
    default: 0,
  },
  following: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  followers: [
    {
      type: Schema.ObjectId,
      ref: "User",
    },
  ],
  userDetails: {
    name: {
      type: String,
      default: "",
    },
    homeState: {
      type: String,
      default: "",
    },
    regNum: {
      type: String,
    },
    mobile: {
      type: String,
    },
    gradCourse: {
      type: String,
      default: "nothing selected",
    },
    password: String,
    socialLinks: {
      linkedInLink: {
        type: String,
        default: "",
      },
      githubLink: {
        type: String,
        default: "",
      },
    },
    otherThings: {},
  },
  jobDetails: {
    company: {
      type: String,
      default: "LNMIIT",
    },
    role: {
      type: String,
      default: "Student",
    },
  },
  fieldOfInterest: {
    type: String,
    default: "nothing selected",
  },
  // assigned coordination tag : ex - Class Representative or Placement Coordinator
  tag: {
    type: String,
    default: "",
  },
  // any person who is assigned as a coordinator
  isTag: {
    type: Boolean,
    default: false,
  },
  rollNum: Number,
  profilePic: {
    givenName: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  lastLogin: {
    timestamp: {
      type: Date,
      default: null,
    },
    location: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
      ipAddress: {
        type: String,
        default: "",
      },
    },
  },
});

module.exports = mongoose.model("User", userSchema);
