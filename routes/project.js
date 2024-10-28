import express from 'express';
export const router = express.Router();

import { createProject, getAllProjects} from "../controllers/project.js";

router.get("/create", createProject);
router.get('/all/:userId', getAllProjects)

export default router;