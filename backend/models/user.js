const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\+?[\d\s-]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },

    profilePic: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "Hello! I'm a passionate host who loves to share my space with travelers from around the world.",
    },
    location: {
      type: String,
      default: null,
    },
    languages: {
      type: [String],
      default: ["English"],
    },
    responseRate: {
      type: String,
      default: "95%",
    },
    responseTime: {
      type: String,
      default: "within an hour",
      enum: ["within an hour", "within a few hours", "within a day", "Not available"],
    },
    totalGuests: {
      type: Number,
      default: 0,
    },
    superHost: {
      type: Boolean,
      default: false,
    },
    preferredContact: {
      type: String,
      default: "Email",
      enum: ["Email", "Phone", "Message", "Any"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  limitAttempts: true,
  maxAttempts: 5,
  passwordValidator: function (password, cb) {

    const errors = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (errors.length > 0) {
      return cb(errors.join(", "));
    }

    return cb(null);
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
