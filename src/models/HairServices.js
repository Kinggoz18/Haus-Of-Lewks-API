import mongoose, { Schema } from 'mongoose';

const HairServicesSchema = new Schema({
  title: { type: String, required: [true, 'Service name is required'] },
  price: { type: Number, required: [true, 'Service price is required'] },
  category: {
    type: String,
    required: [true, 'Service category is required']
  },
  duration: {
    type: Number,
    required: [true, 'Service Duration is required']
  }
});

HairServicesSchema.index({ title: 1, category: 1 }, { unique: true });

const HairServicesModel = mongoose.model('HairService', HairServicesSchema);
export default HairServicesModel;
