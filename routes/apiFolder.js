import express from "express";
import {createFolder, getAllFolders, getFolderApis, addApiToFolder} from '../controllers/apiFolder.js';
const router = express.Router();

router.post("/create", createFolder);
router.post("/all", getAllFolders);
router.post("/getApis", getFolderApis);
router.post("/addApi", addApiToFolder);

export default router;