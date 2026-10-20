const express = require('express');
const router = express.Router();
const {
  createContactRequest,
  trackContactRequest,
  getAllContactRequests,
  updateContactRequestStatus,
  rateWorkerAfterApproval,
} = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const { validateContactRequest, validateRating } = require('../middleware/validators');

router
  .route('/')
  .post(validateContactRequest, createContactRequest)
  .get(protect, getAllContactRequests);

router.get('/track/:identifier', trackContactRequest);
router.patch('/:id/status', protect, updateContactRequestStatus);
router.post('/:id/rate', validateRating, rateWorkerAfterApproval);

module.exports = router;
