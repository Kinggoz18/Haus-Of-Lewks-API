import mongoose from 'mongoose';

const cronJobSchema = new mongoose.Schema({
  name: { type: String },
  jobType: {
    type: String,
    enum: ['UPDATE_BOOKING_STATUS'],
    required: true
  },
  jobDateTime: {
    type: String
  }
});

const CronJob = mongoose.model('CronJobs', cronJobSchema);
export default CronJob;
