import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoute from "./routes/auth.route.js";
// import uploadRoute from "./routes/upload.route.js";
import incomeRoute from "./routes/income.route.js";
import expenseRoute from "./routes/expense.route.js";
import dashboardRoute from "./routes/dashboard.route.js";

import { errorHandler } from "./middlewares/errorhandler.middleware.js";
import { ApiError } from "./utils/ApiError.js";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Expense Tracker API is running smoothly!",
    status: "Success",
  });
});

app.use("/api/v1/auth", authRoute);
// app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/income", incomeRoute);
app.use("/api/v1/expense", expenseRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use((req, res, next) => {
  next(new ApiError(404, "Route not found"));
});

app.use(errorHandler);

export { app };
