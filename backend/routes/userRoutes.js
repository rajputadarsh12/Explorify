import express from 'express';
import { 
  getUserProfile, 
  updatePreferences, 
  addSavedDestination, 
  removeSavedDestination 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile/preferences', protect, updatePreferences);
router.post('/profile/destinations', protect, addSavedDestination);
router.delete('/profile/destinations/:name', protect, removeSavedDestination);

export default router;
