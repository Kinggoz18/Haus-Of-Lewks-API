import mongoose, { Schema } from 'mongoose';

const AddonSChema = new Schema({
  title: { type: String, required: [true, 'Add on title is required'] },
  price: { type: Number, required: [true, 'Add on price is required'] },
  service: { type: String, default: null },
  duration: { type: Number, required: [true, 'Service Duration is required'] }
});

const AddOnsModel = mongoose.model('ServiceAddOn', AddonSChema);
export default AddOnsModel;
