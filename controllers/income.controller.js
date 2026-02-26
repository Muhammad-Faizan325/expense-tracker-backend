import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Income from "../models/income.model.js";
import * as XLSX from "xlsx";

export const addIncome = asyncHandler(async (req, res) => {
    const { source, amount, date, icon } = req.body;

    if (!source || !amount || !date || !icon) {
        throw new ApiError(400, "All fields are required");
    }

    const income = await Income.create({
        source,
        amount,
        date,
        icon,
        userId: req.user.id
    });

    return res.status(201).json(new ApiResponse(201, income, "Income added successfully"));
});

export const getAllIncome = asyncHandler(async (req, res) => {
    const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });

    return res.status(200).json(new ApiResponse(200, incomes, "Incomes fetched successfully"));
});

export const editIncome = asyncHandler(async (req, res) => {
    const { incomeId } = req.params;
    const { source, amount, date, icon } = req.body;

    const income = await Income.findOneAndUpdate(
        { _id: incomeId, userId: req.user.id },
        { $set: { source, amount, date, icon } },
        { returnDocument: "after" }
    );

    if (!income) {
        throw new ApiError(404, "Income record not found");
    }

    return res.status(200).json(new ApiResponse(200, income, "Income updated successfully"));
});

export const deleteIncome = asyncHandler(async (req, res) => {
    const { incomeId } = req.params;

    const income = await Income.findOneAndDelete({ _id: incomeId, userId: req.user.id });

    if (!income) {
        throw new ApiError(404, "Income record not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "Income deleted successfully"));
});

export const downloadIncomeExcel = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    
    const incomes = await Income.find({ userId }).lean();

    if (!incomes || incomes.length === 0) {
        throw new ApiError(404, "No income data available to download");
    }

    const data = incomes.map(item => ({
        Source: item.source || "N/A",
        Amount: item.amount || 0,
        Date: item.date ? new Date(item.date).toISOString().split('T')[0] : "N/A",
        Icon: item.icon || ""
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incomes");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.status(200);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=incomes.xlsx");

    return res.end(buffer);
});