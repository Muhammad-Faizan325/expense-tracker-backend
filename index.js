import { app } from "./app.js";
import {connectMongoDB} from "./config/db.js";
import dotenv from "dotenv";
import {PORT} from "./constants.js"

dotenv.config({
    path:"./.env"
})

await connectMongoDB()

app.listen(PORT, () => {
    console.log(`🚀 Server up on http://localhost:${PORT}`);
});