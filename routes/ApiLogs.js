import express from 'express';
import createMongooseModel from '../middlewares/createModel.js';
const router = express.Router();

import {runApi} from '../controllers/apiCreation.js';
import createMongooseModelAPI from "../middlewares/createModelDeployed.js";
import {runApi2} from "../controllers/ApiExecution.js";
import {getLogCountByRange, getLogs} from "../controllers/ApiLogs.js";

// first parse and create a model. all endpoints from here will need this model


router.get("/:projectId", getLogs);
router.get('/:projectId/getCount', getLogCountByRange)


export default router;