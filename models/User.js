import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: "https://via.placeholder.com/150",
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
    positivePercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    avgShippingTime: {
      type: String,
      default: "2-3 days",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    activeBids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
      },
    ],
    wonAuctions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
      },
    ],
    createdAuctions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    username: this.username,
    avatar: this.avatar,
    rating: this.rating,
    reviews: this.reviews,
    sales: this.sales,
    positivePercentage: this.positivePercentage,
    avgShippingTime: this.avgShippingTime,
    isVerified: this.isVerified,
  };
};

const User = mongoose.model("User", userSchema);

export default User;
