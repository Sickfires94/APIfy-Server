import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {saveBuilderState, getBuilderState, deleteBuilderState } from '../controllers/ApiBuilder.js';

// first parse and create a model. all endpoints from here will need this model
router.post("/update/:apiConfigId", saveBuilderState);
router.post("/get/:apiConfigId", getBuilderState)
router.post('/delete/:apiConfigId', deleteBuilderState);
// router.post('/:project/:api', deployAPI)


export default router;