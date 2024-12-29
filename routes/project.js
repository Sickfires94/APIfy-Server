import express from 'express';
export const router = express.Router();

import { createProject, getAllProjects, getProject} from "../controllers/project.js";

router.get("/create", createProject);
router.get('/all', getAllProjects)
router.get('/get/:name', getProject)

export default router;