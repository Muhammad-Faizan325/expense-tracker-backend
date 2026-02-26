import mongoose from "mongoose";
import Income from "../models/income.model.js";
import { Expense } from "../models/expense.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";

export const getDashboard = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id || req.user?.id);

    console.log("Logged-in User ID:", userId);
    // Dates calculate kar lo
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 1. Total Income Pipeline
    const totalIncomeData = await Income.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 2. Total Expense Pipeline
    const totalExpenseData = await Expense.aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 3. Last 60 Days Income & Transactions
    const last60DaysIncomeData = await Income.aggregate([
        { $match: { userId, date: { $gte: sixtyDaysAgo } } },
        { $facet: {
            total: [{ $group: { _id: null, sum: { $sum: "$amount" } } }],
            transactions: [{ $sort: { date: -1 } }]
        }}
    ]);

    console.log("UserID being searched:", userId);
    console.log("sixty days",sixtyDaysAgo)
console.log("Sixty Days Ago Date:", sixtyDaysAgo);

    // 4. Last 30 Days Expense & Transactions
    const last30DaysExpenseData = await Expense.aggregate([
        { $match: { userId, date: { $gte: thirtyDaysAgo } } },
        { $facet: {
            total: [{ $group: { _id: null, sum: { $sum: "$amount" } } }],
            transactions: [{ $sort: { date: -1 } }]
        }}
    ]);

    // 5. Recent 5 Transactions (Income & Expense alag alag)
    const recentIncome = await Income.find({ userId }).sort({ date: -1 }).limit(5);
    const recentExpense = await Expense.find({ userId }).sort({ date: -1 }).limit(5);

    // Calculation for totals
    const totalIncome = totalIncomeData[0]?.total || 0;
    const totalExpenses = totalExpenseData[0]?.total || 0;
    const incomeLast60Days = last60DaysIncomeData[0]?.total[0]?.sum || 0;
    const expensesLast30Days = last30DaysExpenseData[0]?.total[0]?.sum || 0;

    return res.status(200).json(new ApiResponse(200, {
        totalBalance: totalIncome - totalExpenses,
        totalIncome,
        totalExpenses,
        last30DaysExpenses: {
            total: expensesLast30Days,
            transactions: last30DaysExpenseData[0]?.transactions || []
        },
        last60DaysIncome: {
            total: incomeLast60Days,
            transactions: last60DaysIncomeData[0]?.transactions || []
        },
        recentTransactions: {
            income: recentIncome,
            expense: recentExpense
        }
    }, "Dashboard data fetched successfully"));
});