import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    prospectName: { type: String, trim: true },
    serviceType: { type: String, trim: true },
    dollarAmount: { type: Number },
    stage: {
      type: String,
      enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
      default: 'Prospecting',
    },
    percentLikelihood: { type: Number, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.model('Deal', dealSchema);
