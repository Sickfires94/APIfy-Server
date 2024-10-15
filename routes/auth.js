import express from 'express';
export const router = express.Router();

import { login, signUp, forgetPassword } from '../controllers/auth.js';

router.post('/login', login);
router.post('/signup', signUp);
router.post('/forgetPassword', forgetPassword);


export default router;