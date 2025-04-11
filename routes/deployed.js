import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {runApi} from '../controllers/apiCreation.js';
import createMongooseModelAPI from "../middlewares/createModelDeployed.js";

// first parse and create a model. all endpoints from here will need this model


router.post("/:project/:name", createMongooseModelAPI, runApi);
router.get("/:project/:name", createMongooseModelAPI, runApi);
// router.post('/:project/:api', deployAPI)


export default router;