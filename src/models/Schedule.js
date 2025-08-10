import mongoose, { Schema } from 'mongoose';

const ScheduleSchema = new Schema({
  year: { type: String, required: [true, 'Year is requried'] }, //2002
  month: { type: String, required: [true, 'Month is requried'] }, //January
  day: { type: String, required: [true, 'Day is requried'] }, //Day
  startTime: { type: String, required: [true, 'Start time is requried'] }, //10:00
  endTime: { type: String, required: [true, 'End time is requried'] }, //18:00
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  availableSlots: [
    { type: String, required: [true, `Available slots are required`] }
  ] // Precomputed during booking e.g., ['10:00', '12:00', '14:00']
});

ScheduleSchema.index(
  { year: 1, month: 1, day: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

const ScheduleModel = mongoose.model('Schedule', ScheduleSchema);
export default ScheduleModel;
