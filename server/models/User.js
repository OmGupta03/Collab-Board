import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    // Password hash for email/password login
    passwordHash: {
      type: String,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },

    // Used for Google OAuth users
    googleId: {
      type: String,
      default: null,
    },

    preferences: {
      theme: { type: String, default: "light" },
      defaultBrushSize: { type: Number, default: 4 },
      defaultColor: { type: String, default: "#1E1A14" },
    },

    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {

  if (!this.isModified("passwordHash") || !this.passwordHash) return;

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);

});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false; // Google users don't have password
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

export default User;
