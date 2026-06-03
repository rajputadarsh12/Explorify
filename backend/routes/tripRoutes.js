import express from 'express';
import { createTrip, getTrips, getTripById, shareTrip, getSharedTrip, cloneSharedTrip, deleteTrip, updateTrip, suggestDestination, generateTrip, chatUpdateTrip, generatePackingList, getCommunityTrips, getLiveDeals } from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

// Multer Config
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.route('/suggest').post(protect, suggestDestination);
router.route('/generate').post(protect, generateTrip);
router.route('/shared/:id').get(getSharedTrip);
router.route('/community/all').get(getCommunityTrips);
router.route('/').get(protect, getTrips);
router.route('/create').post(protect, createTrip);
router.route('/:id').get(protect, getTripById).delete(protect, deleteTrip).put(protect, updateTrip);
router.route('/:id/deals').get(protect, getLiveDeals);
router.route('/:id/upload').post(protect, upload.single('image'), async (req, res, next) => {
  // Hand off to controller
  req.uploadedFile = req.file;
  next();
}, updateTrip); // We will update updateTrip in the controller to handle req.uploadedFile
router.route('/:id/share').put(protect, shareTrip);
router.route('/:id/save').post(protect, cloneSharedTrip);
router.route('/:id/chat').post(protect, chatUpdateTrip);
router.route('/:id/packing-list').post(protect, generatePackingList);

export default router;
