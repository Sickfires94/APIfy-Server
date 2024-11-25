import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {createAPI, runAPI} from '../controllers/apiCreation.js';

// first parse and create a model. all endpoints from here will need this model
router.post("/create", createAPI);
router.use(createMongooseModel);
router.post('/run', runAPI);


export default router;