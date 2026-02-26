import express from "express";
import {
  loginUser,
  registerUser,
  getUserInfo,
  uploadProfileImage,
} from "../controllers/auth.controller.js"; // .js zaroori hai
import { jwtMiddleware } from "../middlewares/auth.middleware.js";
// import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.use(jwtMiddleware);

router.get("/get-user", getUserInfo);

export default router;
