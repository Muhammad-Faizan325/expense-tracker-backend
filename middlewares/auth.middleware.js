import {jwtVerify} from "../utiLs/verify-jwt.js";
import { JWTSECRET } from "../constants.js";
import { ApiError } from "../utils/ApiError.js";

export const jwtMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = null;

    // From header: "Authorization: Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Alternatively, from cookie (if using cookie-parser)
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }


    if (!token) {
      throw new ApiError(401, "Authorization token missing");
    }

    console.log("token",token)
  
    const decoded = await jwtVerify(token,JWTSECRET);

    console.log("decode",decoded)
    
    req.user = decoded;

    console.log("user",req.user)

    next(); 
  } catch (err) {
    next(err instanceof ApiError ? err : new ApiError(401, "Invalid or expired token"));
  }
};