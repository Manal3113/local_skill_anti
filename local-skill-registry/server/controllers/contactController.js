const ContactRequest = require('../models/ContactRequest');
const Worker = require('../models/Worker');

// @desc    Submit a contact request for a worker (Privacy protected)
// @route   POST /api/contact-requests
// @access  Public
const createContactRequest = async (req, res) => {
  try {
    const { workerId, requesterName, requesterPhone, requesterEmail, requesterOrganization, purpose } =
      req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'The requested worker could not be found.',
      });
    }

    const contactReq = new ContactRequest({
      workerId: worker._id,
      workerName: worker.name,
      workerSkill: worker.skillCategory,
      workerVillage: worker.village,
      requesterName: requesterName.trim(),
      requesterPhone: requesterPhone.trim(),
      requesterEmail: requesterEmail ? requesterEmail.trim() : '',
      requesterOrganization: requesterOrganization.trim(),
      purpose: purpose.trim(),
    });

    const saved = await contactReq.save();

    return res.status(201).json({
      success: true,
      message: 'Contact request submitted successfully! Your request is pending Gram Panchayat verification.',
      trackingId: saved.trackingId,
      accessCode: saved.accessCode,
      requestId: saved._id,
      request: {
        id: saved._id,
        trackingId: saved.trackingId,
        workerName: saved.workerName,
        workerSkill: saved.workerSkill,
        workerVillage: saved.workerVillage,
        status: saved.status,
        createdAt: saved.createdAt,
      },
    });
  } catch (err) {
    console.error('Error creating contact request:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit contact request.',
      error: err.message,
    });
  }
};

// @desc    Track contact request status & reveal worker phone if approved
// @route   GET /api/contact-requests/track/:identifier
// @access  Public
const trackContactRequest = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { accessCode, phone } = req.query;

    // Search either by trackingId, _id, or requesterPhone
    let query = {};
    if (identifier.startsWith('LSR-')) {
      query.trackingId = identifier;
    } else if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = identifier;
    } else {
      query.requesterPhone = identifier.replace(/\D/g, '');
    }

    const requests = await ContactRequest.find(query).sort({ createdAt: -1 });

    if (!requests || requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No contact request found matching the provided reference.',
      });
    }

    // Process requests and reveal worker phone if approved and access verified
    const processed = await Promise.all(
      requests.map(async (item) => {
        const itemObj = item.toObject();
        let revealedPhone = null;

        if (item.status === 'approved') {
          // If approved, fetch actual worker phone
          const targetWorker = await Worker.findById(item.workerId);
          if (targetWorker) {
            revealedPhone = targetWorker.phone;
          }
        }

        return {
          ...itemObj,
          revealedPhone,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: processed.length,
      requests: processed,
    });
  } catch (err) {
    console.error('Error tracking contact request:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve request status.',
      error: err.message,
    });
  }
};

// @desc    Get all contact requests (for Panchayat Clerk Dashboard)
// @route   GET /api/contact-requests
// @access  Admin only
const getAllContactRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { requesterName: regex },
        { workerName: regex },
        { requesterOrganization: regex },
        { trackingId: regex },
        { purpose: regex },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await ContactRequest.countDocuments(query);
    const requests = await ContactRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.status(200).json({
      success: true,
      count: requests.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requests,
    });
  } catch (err) {
    console.error('Error fetching contact requests:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch contact requests.',
      error: err.message,
    });
  }
};

// @desc    Approve or Deny a contact request
// @route   PATCH /api/contact-requests/:id/status
// @access  Admin only
const updateContactRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['approved', 'denied', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved, denied, or pending.',
      });
    }

    const contactReq = await ContactRequest.findById(req.params.id);
    if (!contactReq) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found.',
      });
    }

    contactReq.status = status;
    contactReq.reviewedAt = new Date();
    contactReq.reviewedBy = req.user ? req.user.fullName : 'Gram Panchayat Clerk';
    if (adminNotes !== undefined) {
      contactReq.adminNotes = adminNotes.trim();
    }

    const updated = await contactReq.save();

    return res.status(200).json({
      success: true,
      message: `Contact request ${status} successfully.`,
      request: updated,
    });
  } catch (err) {
    console.error('Error updating contact request status:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update contact request status.',
      error: err.message,
    });
  }
};

// @desc    Submit a 1-5 star rating and review for an approved worker contact
// @route   POST /api/contact-requests/:id/rate
// @access  Public (Validated against approved request)
const rateWorkerAfterApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, reviewerName } = req.body;

    const contactReq = await ContactRequest.findById(id);
    if (!contactReq) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found.',
      });
    }

    if (contactReq.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate a worker after your contact request has been approved by the Panchayat.',
      });
    }

    if (contactReq.hasRated) {
      return res.status(400).json({
        success: false,
        message: 'A rating has already been submitted for this engagement.',
      });
    }

    const worker = await Worker.findById(contactReq.workerId);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker record not found.',
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    // Add review to worker ratings subdocuments
    worker.ratings.push({
      rating: numRating,
      comment: comment ? comment.trim() : '',
      reviewerName: reviewerName ? reviewerName.trim() : contactReq.requesterName,
      reviewerOrg: contactReq.requesterOrganization,
      requestId: contactReq._id,
      createdAt: new Date(),
    });

    // Recalculate average rating
    const totalScore = worker.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    worker.ratingCount = worker.ratings.length;
    worker.rating = Number((totalScore / worker.ratingCount).toFixed(1));

    await worker.save();

    // Mark contact request as rated
    contactReq.hasRated = true;
    await contactReq.save();

    return res.status(200).json({
      success: true,
      message: 'Thank you! Your feedback and rating have been recorded for this worker.',
      newAverageRating: worker.rating,
      totalRatings: worker.ratingCount,
    });
  } catch (err) {
    console.error('Error submitting rating:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to record rating.',
      error: err.message,
    });
  }
};

module.exports = {
  createContactRequest,
  trackContactRequest,
  getAllContactRequests,
  updateContactRequestStatus,
  rateWorkerAfterApproval,
};
