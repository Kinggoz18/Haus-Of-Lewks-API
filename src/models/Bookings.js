import mongoose from 'mongoose';
import BookingStatusEnum from '../util/enums/BookingStatus.js';

const AddOnSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Add-on title is required'] },
    price: { type: Number, required: [true, 'Add-on price is required'] }
  },
  { _id: false }
);

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Service title is required'] },
    price: { type: Number, required: [true, 'Service price is required'] },
    category: {
      type: String,
      required: [true, 'Service category is required']
    },
    duration: {
      //The total duation, including the add ons
      type: Number, // in minutes
      required: [true, 'Service Duration is required']
    },
    AddOns: {
      type: [AddOnSchema],
      default: []
    },
    hairServiceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Hair service Id is required'],
      ref: 'HairService'
    }
  },
  { _id: false }
);

export const BookingSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    phone: { type: String, required: [true, 'Phone is required'] },
    email: { type: String, required: [true, 'Email is required'] },
    startTime: { type: String, required: [true, 'Booking time is required'] },
    AdditionalNotes: { type: String, default: null },
    customServiceDetail: { type: String, default: null },
    scheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Schedule Id is required']
    },
    service: { type: serviceSchema },
    status: {
      type: String,
      enum: BookingStatusEnum,
      required: [true, 'Booking status is required']
    },
    total: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index: one booking per startTime per schedule
BookingSchema.index({ scheduleId: 1, startTime: 1 }, { unique: true });

const BookingModel = mongoose.model('Booking', BookingSchema);
export default BookingModel;
