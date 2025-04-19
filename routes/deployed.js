import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {runApi} from '../controllers/apiCreation.js';
import createMongooseModelAPI from "../middlewares/createModelDeployed.js";
import {runApi2} from "../controllers/ApiExecution.js";

// first parse and create a model. all endpoints from here will need this model


router.post("/:project/:name", createMongooseModelAPI, runApi2);
router.get("/:project/:name", createMongooseModelAPI, runApi2);
// router.post('/:project/:api', deployAPI)


export default router;