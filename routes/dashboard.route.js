import express from "express";
import { getDashboard } from "../controllers/dashboard.contoller.js"; // .js zaroori hai
import { jwtMiddleware } from "../middlewares/auth.middleware.js";



const router = express.Router();

router.use(jwtMiddleware); 

router.get("/", getDashboard); 


export default router;
