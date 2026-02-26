import express from "express";
import { 
   addExpense,
   getAllExpenses,
   editExpense,
   deleteExpense,
   downloadExpenseExcel,
} from "../controllers/expense.controller.js";
import { jwtMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(jwtMiddleware); 

router.post("/add", addExpense);
router.get("/get", getAllExpenses);
router.put("/edit/:expenseId", editExpense);
router.delete("/delete/:expenseId", deleteExpense);
router.get("/download-excel", downloadExpenseExcel);

export default router;