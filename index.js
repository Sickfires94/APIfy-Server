import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
const app = express();
const port = process.env.port || 3001;

import authRouter from "./routes/auth.js";
import accountManagementRouter from "./routes/accountManagement.js";
import profileRouter from "./routes/profile.js"

import { verifyToken } from "./middlewares/verifyToken.js";
import { checkAdmin } from "./middlewares/checkAdmin.js";

app.use(cors());
app.use(json());
app.use("/auth", authRouter);
app.use(verifyToken); // This is the middleware that checks for the token
app.use("/profile", profileRouter);
app.use(checkAdmin); // This is the middleware that checks for the admin role
app.use("/accountManagement", accountManagementRouter);

const connectDB = async () => {
  try {
    await connect(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@fyp-cluster.iweaj.mongodb.net/`
    );
    console.log("Connected to the database");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error connecting to the database", error);
  }
};
connectDB();