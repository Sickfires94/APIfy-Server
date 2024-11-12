import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {createModel, addColum, getUserModels, addRow} from '../controllers/modelRegistry.js';

router.post("/create", createModel);
router.post('/addColum', addColum);
router.get('/getUserModels', getUserModels)

// first parse and create a model. all endpoints from here will need this model
router.use(createMongooseModel);

router.get('/addRow', addRow)

export default router;