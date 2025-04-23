/**
 * Initializes mongoose and express.
 */

import "module-alias/register";
import mongoose from "mongoose";
import app from "src/app";
import env from "src/util/validateEnv";

const PORT = env.PORT || 5000;
const MONGODB_URI = env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Mongoose connected!");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(console.error);
