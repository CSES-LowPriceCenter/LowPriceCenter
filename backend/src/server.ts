/**
 * Initializes mongoose and express.
 */

import "module-alias/register";
import mongoose from "mongoose";
import app from "src/app";
import env from "src/util/validateEnv";

const PORT = env.PORT || 5000;
const MONGODB_URI = env.MONGODB_URI;

console.log("Connecting to MongoDB...");
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Mongoose connected!");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

