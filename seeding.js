import mongoose from "mongoose";
import dotenv from "dotenv";
import Income from "./models/income.model.js"; 
import { Expense } from "./models/expense.model.js";

dotenv.config();

const seedData = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found in .env file");

        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB. Cleaning old data...");

        // 1. Pehle pura purana data khatam karo (Taake Blue dates nikal jayein)
        await Income.deleteMany({}); 
        await Expense.deleteMany({});
        console.log("🧹 Database cleared successfully.");

        const userId = new mongoose.Types.ObjectId("699d7a178b91da65046e9623");

        const incomeCats = ["Salary", "Freelance", "Stocks"];
        const expenseCats = ["Food", "Petrol", "Rent", "Bills", "Internet"];
        
        const incomeIcons = { "Salary": "wallet", "Freelance": "laptop", "Stocks": "trending-up" };
        const expenseIcons = { "Food": "utensils", "Petrol": "fuel", "Rent": "home", "Bills": "file-invoice", "Internet": "wifi" };

        let incomes = [];
        let expenses = [];

        // Generating 100 entries (Sequential)
        for (let i = 0; i < 100; i++) {
            // Har iteration mein nayi date object banayein
            let d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(12, 0, 0, 0); // Time ko beech mein rakhna behtar hai comparison ke liye

            const iCat = incomeCats[i % incomeCats.length];
            incomes.push({
                userId,
                source: iCat,
                amount: Math.floor(Math.random() * 5000) + 10000, 
                date: d, // Seeded as a pure Date Object
                icon: incomeIcons[iCat] || "dollar-sign"
            });

            const eCat = expenseCats[i % expenseCats.length];
            expenses.push({
                userId,
                category: eCat,
                amount: Math.floor(Math.random() * 2000) + 500,
                date: d, // Seeded as a pure Date Object
                icon: expenseIcons[eCat] || "shopping-cart"
            });
        }

        // 2. Naya data insert karo
        await Income.insertMany(incomes);
        await Expense.insertMany(expenses);

        console.log(`🚀 Success! Seeded 200 records with MAROON (Object) dates.`);
        process.exit();

    } catch (error) {
        console.error("❌ Seeding failed:", error.message);
        process.exit(1);
    }
};

seedData();