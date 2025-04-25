/**
 * Initializes mongoose and express.
 */

import "module-alias/register";
import mongoose from "mongoose";
import app from "src/app";
import env from "src/util/validateEnv";

const PORT = env.PORT;
const MONGODB_URI = env.MONGODB_URI;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("Mongoose connected!"))
    .catch(err => console.error("MongoDB connection error:", err));
});

