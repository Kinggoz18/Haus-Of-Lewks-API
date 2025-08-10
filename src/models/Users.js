import mongoose, { Schema } from 'mongoose';
import UserRolesEnum from '../util/enums/UserRoles.js';

const UserSchema = new Schema({
  googleId: { type: String },
  googleEmail: { type: String },

  firstName: { type: String, required: [true, 'First name is required'] },
  lastName: { type: String, required: [true, 'Last name is required'] },
  phone: { type: String, required: [true, 'Phone is required'], unique: true },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  role: {
    type: String,
    enum: UserRolesEnum,
    required: [true, 'Admin role is required']
  },
  isBlocked: { type: Boolean, default: false } //Customers are blocked when they miss two bookings
});

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
