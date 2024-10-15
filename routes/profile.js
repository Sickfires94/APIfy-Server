import express from 'express';
export const router = express.Router();

import { changePassword, deleteMyAccount, viewProfile } from "../controllers/profile.js";

router.post("/viewProfile", viewProfile);
router.post("/changePassword", changePassword);
router.post("/deleteMyAccount", deleteMyAccount);

export default router;