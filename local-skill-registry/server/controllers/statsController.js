const Worker = require('../models/Worker');
const ContactRequest = require('../models/ContactRequest');
const { isSupabaseConfigured } = require('../config/supabase');
const supabaseService = require('../services/supabaseService');

// @desc    Get dashboard metrics & analytics
// @route   GET /api/stats
// @access  Public
const getStats = async (req, res) => {
  if (isSupabaseConfigured()) {
    try {
      const stats = await supabaseService.getStats();
      return res.status(200).json({ success: true, stats });
    } catch (err) {
      console.warn('[Database Fallback] Supabase stats failed, falling back to MongoDB:', err.message);
    }
  }

  try {
    const [
      totalWorkers,
      verifiedWorkers,
      availableWorkers,
      skillsList,
      villagesList,
      totalRequests,
      pendingRequests,
      approvedRequests,
      skillDistribution,
      villageDistribution,
    ] = await Promise.all([
      Worker.countDocuments(),
      Worker.countDocuments({ isVerified: true }),
      Worker.countDocuments({ availabilityStatus: 'available' }),
      Worker.distinct('skillCategory'),
      Worker.distinct('village'),
      ContactRequest.countDocuments(),
      ContactRequest.countDocuments({ status: 'pending' }),
      ContactRequest.countDocuments({ status: 'approved' }),
      Worker.aggregate([
        { $group: { _id: '$skillCategory', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Worker.aggregate([
        { $group: { _id: '$village', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const verificationRate = totalWorkers > 0 ? Math.round((verifiedWorkers / totalWorkers) * 100) : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalWorkers,
        verifiedWorkers,
        verificationRate,
        availableWorkers,
        totalSkills: skillsList.length,
        totalVillages: villagesList.length,
        totalRequests,
        pendingRequests,
        approvedRequests,
        skillDistribution,
        villageDistribution,
      },
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics metrics.',
      error: err.message,
    });
  }
};

module.exports = {
  getStats,
};
