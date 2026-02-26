import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Expense } from "../models/expense.model.js"; // Expense model import
import * as XLSX from "xlsx";
import mongoose from "mongoose";


export const addExpense = asyncHandler(async (req, res) => {
    const { category, amount, date, icon } = req.body;

    if (!category || !amount || !date || !icon) {
        throw new ApiError(400, "All fields are required (category, amount, date, icon)");
    }

    const expense = await Expense.create({
        category,
        amount,
        date,
        icon,
        userId: req.user?.id || req.user?._id
    });

    return res.status(201).json(new ApiResponse(201, expense, "Expense added successfully"));
});


export const getAllExpenses = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 });

    return res.status(200).json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

export const editExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;
    const { category, amount, date, icon } = req.body;
    const userId = req.user?.id || req.user?._id;

    // --- LOGS FOR DEBUGGING ---
    console.log("------- DEBUG START -------");
    console.log("1. Expense ID from Params:", expenseId);
    console.log("2. User ID from Auth:", userId);
    console.log("3. Body Data:", { category, amount, date, icon });
    
    // Check if IDs are valid MongoDB ObjectIds
    const isValidExpenseId = mongoose.Types.ObjectId.isValid(expenseId);
    const isValidUserId = mongoose.Types.ObjectId.isValid(userId);
    console.log("4. Is Expense ID Valid?:", isValidExpenseId);
    console.log("5. Is User ID Valid?:", isValidUserId);
    console.log("------- DEBUG END -------");

    if (!isValidExpenseId) {
        throw new ApiError(400, "Invalid Expense ID format");
    }

    const expense = await Expense.findOneAndUpdate(
        { 
            _id: new mongoose.Types.ObjectId(expenseId), 
            userId: new mongoose.Types.ObjectId(userId) 
        },
        { 
            $set: { category, amount, date, icon } 
        },
        { new: true, runValidators: true } 
    );

    if (!expense) {
        // Agar yahan pohancha, to logs dekho. 
        // Ya to ye ID database mein nahi hai, ya ye is User ki nahi hai.
        throw new ApiError(404, "Expense record not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, expense, "Expense updated successfully")
    );
});


export const deleteExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.params;

    const expense = await Expense.findOneAndDelete({ 
        _id: expenseId, 
        userId: req.user?.id || req.user?._id 
    });

    if (!expense) {
        throw new ApiError(404, "Expense record not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Expense deleted successfully"));
});


export const downloadExpenseExcel = asyncHandler(async (req, res) => {
    const userId = req.user?.id || req.user?._id;
    
    const expenses = await Expense.find({ userId }).lean();

    if (!expenses || expenses.length === 0) {
        throw new ApiError(404, "No expense data available to download");
    }

    const data = expenses.map(item => ({
        Category: item.category || "N/A",
        Amount: item.amount || 0,
        Date: item.date ? new Date(item.date).toISOString().split('T')[0] : "N/A",
        Icon: item.icon || ""
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.status(200);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=expenses.xlsx");

    return res.end(buffer);
});