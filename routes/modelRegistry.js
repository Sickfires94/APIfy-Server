import express from 'express';
const router = express.Router();

import {createModel, addColum} from '../controllers/modelRegistry.js';
router.post("/create", createModel);
router.post('/addColum', addColum);

export default router;