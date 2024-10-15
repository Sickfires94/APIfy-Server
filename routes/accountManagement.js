import express from 'express';
export const accountManagementRouter = express.Router();

import { getAllUsers, deleteAccount, getUserByName, countUsers } from '../controllers/accountManagement.js';


accountManagementRouter.get('/getUsers', getAllUsers);
accountManagementRouter.post('/getUserByName', getUserByName);
accountManagementRouter.post('/deleteAccount', deleteAccount);
accountManagementRouter.get('/countUsers', countUsers);

export default accountManagementRouter;