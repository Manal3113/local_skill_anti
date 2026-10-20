const express = require('express');
const router = express.Router();
const {
  getWorkers,
  getWorkerById,
  createWorker,
  toggleWorkerVerification,
  updateWorker,
  deleteWorker,
  getFilterOptions,
} = require('../controllers/workerController');
const { protect } = require('../middleware/auth');
const { validateWorkerRegistration } = require('../middleware/validators');

// Optional auth token extractor so admin gets unmasked phones if logged in
const optionalAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, next);
  }
  next();
};

router.get('/meta/filters', getFilterOptions);

router
  .route('/')
  .get(optionalAuth, getWorkers)
  .post(validateWorkerRegistration, createWorker);

router
  .route('/:id')
  .get(optionalAuth, getWorkerById)
  .put(protect, updateWorker)
  .delete(protect, deleteWorker);

router.patch('/:id/verify', protect, toggleWorkerVerification);

module.exports = router;
