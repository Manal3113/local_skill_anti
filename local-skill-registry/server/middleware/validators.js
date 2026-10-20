const { body, param, validationResult } = require('express-validator');

// Middleware to check validation results and return formatted response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

const validateWorkerRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Worker name must be between 2 and 100 characters long'),
  body('skillCategory')
    .trim()
    .notEmpty()
    .withMessage('Skill category is required'),
  body('village')
    .trim()
    .notEmpty()
    .withMessage('Village name is required'),
  body('phone')
    .trim()
    .custom((val) => {
      const clean = val.replace(/\D/g, '');
      if (clean.length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number');
      }
      return true;
    }),
  body('availabilityStatus')
    .optional()
    .isIn(['available', 'busy', 'seasonal', 'on_leave'])
    .withMessage('Availability status must be available, busy, seasonal, or on_leave'),
  body('eShramUan')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[A-Za-z0-9- ]{10,24}$/)
    .withMessage('e-Shram UAN should be a valid reference number (e.g. UAN-1234-5678-9012)'),
  body('experienceYears')
    .optional()
    .isInt({ min: 0, max: 60 })
    .withMessage('Experience years must be a valid number between 0 and 60'),
  handleValidationErrors,
];

const validateContactRequest = [
  body('workerId')
    .isMongoId()
    .withMessage('A valid worker ID is required'),
  body('requesterName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Requester name is required (min 2 characters)'),
  body('requesterPhone')
    .trim()
    .custom((val) => {
      const clean = val.replace(/\D/g, '');
      if (clean.length < 10) {
        throw new Error('Please provide a valid 10-digit contact mobile number');
      }
      return true;
    }),
  body('requesterOrganization')
    .trim()
    .notEmpty()
    .withMessage('Please specify your organization or type (e.g. Contractor, Panchayat, Farmer, Resident)'),
  body('purpose')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Please provide a clear description of the work requirement (min 5 characters)'),
  handleValidationErrors,
];

const validateRating = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5 stars'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

module.exports = {
  validateWorkerRegistration,
  validateContactRequest,
  validateRating,
  validateLogin,
};
