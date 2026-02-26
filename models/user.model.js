import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWTSECRET } from "../constants.js";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  profileImageUrl: {
    type: String,
    default: null,
  }
}, { 
  timestamps: true 
});



userSchema.pre("save", async function () { 
 
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email 
    },
    JWTSECRET,
    { 
      expiresIn: "1d"
    }
  );
};

const User = mongoose.model("User", userSchema);
export default User;