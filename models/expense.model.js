import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            index: true
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },
        amount: {
            type: Number,
            required: [true, "Amount is required"],
            min: 0
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
            default: Date.now
        },
        icon: {
            type: String,
            required: [true, "Icon is required"]
        }
    },
    { 
        timestamps: true 
    }
);

export const Expense = mongoose.model("Expense", expenseSchema);