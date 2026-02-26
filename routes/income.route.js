import express from "express";
import { 
    addIncome, 
    getAllIncome, 
    deleteIncome, 
    downloadIncomeExcel, 
    editIncome 
} from "../controllers/income.controller.js";
import { jwtMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(jwtMiddleware); 

router.post("/add", addIncome);
router.get("/get", getAllIncome);
router.put("/edit/:incomeId", editIncome);
router.delete("/delete/:incomeId", deleteIncome);
router.get("/download-excel", downloadIncomeExcel);

export default router;