
import { app } from "./app.js";
import { connectMongoDB } from "./config/db.js";
import { PORT } from "./constants.js";


connectMongoDB()
  .then(() => {
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT || 5000, () => {
        console.log(`🚀 Server up on http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("MongoDB cFonnection failed !!! ", err);
  });

export default app; 