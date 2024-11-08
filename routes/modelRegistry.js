import express from 'express';
const router = express.Router();

import {createModel, addColum, getUserModels} from '../controllers/modelRegistry.js';

router.post("/create", createModel);
router.post('/addColum', addColum);
router.get('/getUserModels', getUserModels)

export default router;