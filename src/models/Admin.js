import mongoose from 'mongoose';
import UserRoles from '../util/enums/UserRoles.js';

const adminSchema = new mongoose.Schema(
  {
    googleId: { type: String },
    googleEmail: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    role: {
      type: String,
      enum: UserRoles,
      required: [true, 'Admin role is required']
    }
  },
  { timestamps: true }
);

const AdminModel = mongoose.model('Admin', adminSchema);
export default AdminModel;
