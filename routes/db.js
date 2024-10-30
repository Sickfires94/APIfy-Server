import express from 'express';
export const router = express.Router();

import {viewProfile } from "../controllers/db.js";

router.post("/viewProfile", viewProfile);

export default router;