const mongoose = require('mongoose');

const ratingSubSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    default: '',
  },
  reviewerName: {
    type: String,
    trim: true,
    default: 'Local Contractor / Resident',
  },
  reviewerOrg: {
    type: String,
    trim: true,
    default: '',
  },
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContactRequest',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const workerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
    },
    skillCategory: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
      index: true,
    },
    village: {
      type: String,
      required: [true, 'Village is required'],
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'seasonal', 'on_leave'],
      default: 'available',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedBy: {
      type: String,
      trim: true,
      default: '',
    },
    verificationDate: {
      type: Date,
    },
    eShramUan: {
      type: String,
      trim: true,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 2,
      min: 0,
      max: 60,
    },
    dailyWageMin: {
      type: Number,
      default: 400,
    },
    dailyWageMax: {
      type: Number,
      default: 800,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Not Specified'],
      default: 'Not Specified',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    ratings: [ratingSubSchema],
  },
  {
    timestamps: true,
  }
);

// Helper method to mask phone number for public privacy
workerSchema.methods.toPublicObject = function () {
  const obj = this.toObject();
  if (obj.phone && obj.phone.length >= 10) {
    const raw = obj.phone.replace(/\D/g, '');
    if (raw.length === 10) {
      obj.phone = `+91 ${raw.slice(0, 2)}•••• ••${raw.slice(-2)}`;
    } else {
      obj.phone = '••••••••••';
    }
  } else {
    obj.phone = '••••••••••';
  }
  return obj;
};

// Text index for fast multi-field search
workerSchema.index({ name: 'text', skillCategory: 'text', village: 'text', bio: 'text' });

module.exports = mongoose.model('Worker', workerSchema);
