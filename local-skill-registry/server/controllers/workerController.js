const Worker = require('../models/Worker');
const { isSupabaseConfigured } = require('../config/supabase');
const supabaseService = require('../services/supabaseService');

// @desc    Get all workers with search, filtering, and pagination
// @route   GET /api/workers
// @access  Public (Phone numbers are masked)
const getWorkers = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'panchayat_clerk');
      const result = await supabaseService.getWorkers(req.query, isAdmin);
      return res.status(200).json({ success: true, ...result });
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, message: "Database offline. Please configure a free MongoDB Atlas database in the .env file.", data: [], error: global.dbError });
  }
  try {
    const {
      search,
      skill,
      village,
      availability,
      verified,
      sortBy = 'rating',
      page = 1,
      limit = 12,
      all = 'false',
    } = req.query;

    const query = {};

    // Text / regex search
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { skillCategory: regex },
        { village: regex },
        { bio: regex },
      ];
    }

    // Skill filter
    if (skill && skill !== 'all') {
      query.skillCategory = skill;
    }

    // Village filter
    if (village && village !== 'all') {
      query.village = village;
    }

    // Availability status filter
    if (availability && availability !== 'all') {
      query.availabilityStatus = availability;
    }

    // Verification status filter
    if (verified === 'true') {
      query.isVerified = true;
    } else if (verified === 'false') {
      query.isVerified = false;
    }

    // Sorting
    let sort = {};
    if (sortBy === 'rating') {
      sort = { rating: -1, ratingCount: -1, createdAt: -1 };
    } else if (sortBy === 'newest') {
      sort = { createdAt: -1 };
    } else if (sortBy === 'experience') {
      sort = { experienceYears: -1 };
    } else if (sortBy === 'name') {
      sort = { name: 1 };
    } else {
      sort = { createdAt: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = all === 'true' ? 1000 : parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Worker.countDocuments(query);
    const rawWorkers = await Worker.find(query).sort(sort).skip(skip).limit(limitNum);

    // Determine if requester is an authenticated admin (check header)
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'panchayat_clerk');

    // Mask phone number unless authenticated admin
    const workers = rawWorkers.map((w) => (isAdmin ? w.toObject() : w.toPublicObject()));

    return res.status(200).json({
      success: true,
      count: workers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      workers,
    });
  } catch (err) {
    console.error('Error fetching workers:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching workers list.',
      error: err.message,
    });
  }
};

// @desc    Get single worker by ID
// @route   GET /api/workers/:id
// @access  Public (Phone number masked for public)
const getWorkerById = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'panchayat_clerk');
      const worker = await supabaseService.getWorkerById(req.params.id, isAdmin);
      if (worker) return res.status(200).json({ success: true, worker });
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, message: "Database offline. Please configure MongoDB Atlas in .env.", data: null });
  }
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found.',
      });
    }

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'panchayat_clerk');
    const data = isAdmin ? worker.toObject() : worker.toPublicObject();

    return res.status(200).json({
      success: true,
      worker: data,
    });
  } catch (err) {
    console.error('Error fetching worker by ID:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching worker details.',
      error: err.message,
    });
  }
};

// @desc    Register a new worker
// @route   POST /api/workers
// @access  Public / Panchayat entry
const createWorker = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'panchayat_clerk');
      const saved = await supabaseService.createWorker(req.body, isAdmin);
      return res.status(201).json({
        success: true,
        message: isAdmin
          ? 'Worker registered and verified successfully!'
          : 'Worker registration submitted successfully! Pending Panchayat verification.',
        worker: saved,
      });
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, message: "Database offline. Please configure MongoDB Atlas in .env to save workers." });
  }
  try {
    const {
      name,
      skillCategory,
      village,
      phone,
      availabilityStatus = 'available',
      eShramUan = '',
      experienceYears = 2,
      dailyWageMin = 400,
      dailyWageMax = 800,
      gender = 'Not Specified',
      bio = '',
    } = req.body;

    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'panchayat_clerk');

    const newWorker = new Worker({
      name: name.trim(),
      skillCategory: skillCategory.trim(),
      village: village.trim(),
      phone: phone.trim(),
      availabilityStatus,
      eShramUan: eShramUan.trim(),
      experienceYears: Number(experienceYears) || 1,
      dailyWageMin: Number(dailyWageMin) || 400,
      dailyWageMax: Number(dailyWageMax) || 800,
      gender,
      bio: bio.trim(),
      isVerified: isAdmin ? true : false,
      verifiedBy: isAdmin ? req.user.fullName : '',
      verificationDate: isAdmin ? new Date() : null,
    });

    const saved = await newWorker.save();

    return res.status(201).json({
      success: true,
      message: isAdmin
        ? 'Worker registered and verified successfully!'
        : 'Worker registration submitted successfully! Pending Panchayat verification.',
      worker: saved.toPublicObject(),
    });
  } catch (err) {
    console.error('Error registering worker:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register worker.',
      error: err.message,
    });
  }
};

// @desc    Toggle verification status of a worker
// @route   PATCH /api/workers/:id/verify
// @access  Admin only
const toggleWorkerVerification = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const updated = await supabaseService.toggleWorkerVerification(req.params.id, req.user);
      if (updated) {
        return res.status(200).json({
          success: true,
          message: `Worker ${updated.isVerified ? 'verified' : 'unverified'} successfully.`,
          worker: updated,
        });
      }
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, message: "Database offline. Cannot modify verification status." });
  }
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found.',
      });
    }

    worker.isVerified = !worker.isVerified;
    if (worker.isVerified) {
      worker.verifiedBy = req.user ? req.user.fullName : 'Gram Panchayat Office';
      worker.verificationDate = new Date();
    } else {
      worker.verifiedBy = '';
      worker.verificationDate = null;
    }

    await worker.save();

    return res.status(200).json({
      success: true,
      message: `Worker ${worker.isVerified ? 'verified' : 'unverified'} successfully.`,
      worker: worker.toObject(),
    });
  } catch (err) {
    console.error('Error toggling worker verification:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update verification status.',
      error: err.message,
    });
  }
};

// @desc    Update worker details
// @route   PUT /api/workers/:id
// @access  Admin only
const updateWorker = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const updated = await supabaseService.updateWorker(req.params.id, req.body);
      if (updated) return res.status(200).json({ success: true, message: 'Worker details updated successfully.', worker: updated });
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, message: "Database offline. Cannot update worker." });
  }
  try {
    const worker = await Worker.findById(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found.',
      });
    }

    const fieldsToUpdate = [
      'name',
      'skillCategory',
      'village',
      'phone',
      'availabilityStatus',
      'eShramUan',
      'experienceYears',
      'dailyWageMin',
      'dailyWageMax',
      'gender',
      'bio',
      'isVerified',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        worker[field] = req.body[field];
      }
    });

    if (req.body.isVerified && !worker.verificationDate) {
      worker.verifiedBy = req.user ? req.user.fullName : 'Gram Panchayat';
      worker.verificationDate = new Date();
    }

    const updated = await worker.save();

    return res.status(200).json({
      success: true,
      message: 'Worker details updated successfully.',
      worker: updated.toObject(),
    });
  } catch (err) {
    console.error('Error updating worker:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update worker.',
      error: err.message,
    });
  }
};

// @desc    Delete worker
// @route   DELETE /api/workers/:id
// @access  Admin only
const deleteWorker = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const deleted = await supabaseService.deleteWorker(req.params.id);
      if (deleted) return res.status(200).json({ success: true, message: 'Worker removed from registry successfully.' });
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, message: "Database offline. Cannot delete worker." });
  }
  try {
    const worker = await Worker.findByIdAndDelete(req.params.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Worker removed from registry successfully.',
    });
  } catch (err) {
    console.error('Error deleting worker:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete worker.',
      error: err.message,
    });
  }
};

// @desc    Get metadata: distinct skills, villages, and availability counts
// @route   GET /api/workers/meta/filters
// @access  Public
const getFilterOptions = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const data = await supabaseService.getFilterOptions();
      return res.status(200).json({ success: true, ...data });
    } catch (err) {
      console.warn('[Database Fallback] Supabase failed, falling back to MongoDB:', err.message);
    }
  }

  if (global.dbConnected === false) {
    return res.status(503).json({ success: false, skills: [], villages: [], availabilityStats: [], message: "Database offline." });
  }
  try {
    const [skills, villages, stats] = await Promise.all([
      Worker.distinct('skillCategory'),
      Worker.distinct('village'),
      Worker.aggregate([
        {
          $group: {
            _id: '$availabilityStatus',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      skills: skills.sort(),
      villages: villages.sort(),
      availabilityStats: stats,
    });
  } catch (err) {
    console.error('Error fetching filter options:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch filter options.',
      error: err.message,
    });
  }
};

module.exports = {
  getWorkers,
  getWorkerById,
  createWorker,
  toggleWorkerVerification,
  updateWorker,
  deleteWorker,
  getFilterOptions,
};
