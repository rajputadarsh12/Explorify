import express from 'express';
import { createTrip, getTrips, getTripById, shareTrip, getSharedTrip, cloneSharedTrip, deleteTrip, updateTrip } from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/shared/:id').get(getSharedTrip);
router.route('/').get(protect, getTrips);
router.route('/create').post(protect, createTrip);
router.route('/:id').get(protect, getTripById).delete(protect, deleteTrip).put(protect, updateTrip);
router.route('/:id/share').put(protect, shareTrip);
router.route('/:id/save').post(protect, cloneSharedTrip);

export default router;
