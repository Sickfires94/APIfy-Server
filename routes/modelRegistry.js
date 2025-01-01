import express from 'express';
const router = express.Router();

import createMongooseModel from '../middlewares/createModel.js';

import {createModel, addColum, getUserModels, addRow, getModel} from '../controllers/modelRegistry.js';

router.post("/create", createModel);
router.post('/addColum', addColum);
router.get('/getUserModels', getUserModels)
router.post('/get', getModel)

// first parse and create a model. all endpoints from here will need this model
router.use(createMongooseModel);

router.get('/addRow', addRow)

export default router;