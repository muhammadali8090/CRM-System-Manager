import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    phone: { type: String, trim: true },
    websiteUrl: { type: String, trim: true },
    revenue: { type: Number },
    industry: { type: String, trim: true },
    salesRepOwner: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Company', companySchema);
