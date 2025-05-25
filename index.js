import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import { connect } from "mongoose";
import authRouter from "./routes/auth.js";
import accountManagementRouter from "./routes/accountManagement.js";
import profileRouter from "./routes/profile.js";
import projectRouter from './routes/project.js';
import modelRegistry from "./routes/modelRegistry.js";
import dbRouter from './routes/db.js'
import apiCreationRouter from "./routes/apiCreation.js";
import deployedRouter from "./routes/deployed.js";
import apiBuilderRouter from "./routes/apiBuilder.js";
import apiFolderRouter from "./routes/apiFolder.js";
import apiLogsRouter from "./routes/apiLogs.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import { checkAdmin } from "./middlewares/checkAdmin.js";
import {deployAPI} from "./controllers/apiCreation.js";



const app = express();
const port = process.env.port || 3001;


app.use(cors());
app.use(json());
app.use("/auth", authRouter);
app.use("/deployed", deployedRouter);
app.use(verifyToken);
app.use("/profile", profileRouter);
app.use('/project', projectRouter);
app.use('/model', modelRegistry)
app.use('/db', dbRouter);
app.use('/apiFolder', apiFolderRouter);
app.use('/api', apiCreationRouter);
app.use('/apibuilder', apiBuilderRouter)
app.use('/logs', apiLogsRouter)
app.use(checkAdmin);
app.use("/accountManagement", accountManagementRouter);


const connectDB = async () => {
  try {
    await connect(
      `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@fyp-cluster.iweaj.mongodb.net/myDatabase?retryWrites=true&w=majority`
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