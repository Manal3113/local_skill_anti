const mongoose = require('mongoose');

const contactRequestSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: [true, 'Target worker is required'],
      index: true,
    },
    workerName: {
      type: String,
      required: true,
    },
    workerSkill: {
      type: String,
      required: true,
    },
    workerVillage: {
      type: String,
      required: true,
    },
    requesterName: {
      type: String,
      required: [true, 'Requester name is required'],
      trim: true,
    },
    requesterPhone: {
      type: String,
      required: [true, 'Requester phone number is required'],
      trim: true,
    },
    requesterEmail: {
      type: String,
      trim: true,
      default: '',
    },
    requesterOrganization: {
      type: String,
      required: [true, 'Requester organization or type is required'],
      trim: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of contact is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'pending',
      index: true,
    },
    trackingId: {
      type: String,
      unique: true,
      index: true,
    },
    accessCode: {
      type: String,
      required: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: String,
      default: '',
    },
    hasRated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate clean tracking ID if not provided
contactRequestSchema.pre('validate', function (next) {
  if (!this.trackingId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.trackingId = `LSR-${Date.now().toString().slice(-4)}-${randomNum}`;
  }
  if (!this.accessCode) {
    this.accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('ContactRequest', contactRequestSchema);
