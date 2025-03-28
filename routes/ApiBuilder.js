import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {createAPI, testAPI, deployAPI, getAPIs} from '../controllers/apiCreation.js';

// first parse and create a model. all endpoints from here will need this model
router.post("/create", createAPI);
router.post("/all", getAPIs)
router.use(createMongooseModel);
router.post('/test', testAPI);
// router.post('/:project/:api', deployAPI)


export default router;