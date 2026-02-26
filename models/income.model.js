import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: [true, "User ID is required"],
  },
  icon: {
    type: String,
    required: [true, "Icon is required"],
    trim: true,
  },
  source: {
    type: String,
    required: [true, "Source of income is required"],
    trim: true,
  },
  amount: {
    type: Number, 
    required: [true, "Amount is required"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now, 
  }
}, { 
  timestamps: true 
});

const Income = mongoose.model("Income", incomeSchema);
export default Income;