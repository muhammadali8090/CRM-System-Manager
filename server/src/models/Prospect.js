import mongoose from 'mongoose';

const prospectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    jobTitle: { type: String, trim: true },
    linkedInUrl: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 500 },
    salesRepOwner: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Prospect', prospectSchema);
