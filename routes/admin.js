import express from 'express';
import {
  approveDoctor,
  getDashboard,
  rejectDoctor
} from '../controllers/admin.js';

const router = express.Router();

// Admin dashboard route
router.get('/', getDashboard);

// Doctor approval/rejection routes - these need full paths
router.put('/approve-doctor/:id', approveDoctor);
router.put('/reject-doctor/:id', rejectDoctor);

export default router;
