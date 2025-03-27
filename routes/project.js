import express from 'express';
export const router = express.Router();

import { createProject, getAllProjects, getProject, getProjectById} from "../controllers/project.js";

router.post("/create", createProject);
router.get('/all', getAllProjects);
router.get('/get/:name', getProject);
router.post('/getById', getProjectById);

export default router;