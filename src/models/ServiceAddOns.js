import mongoose, { Schema } from 'mongoose';

const ServiceAddOnsSchema = new Schema({
  title: { type: String, required: [true, 'Add on title is required'] },
  price: { type: Number, required: [true, 'Add on price is required'] }
});

const ServiceAddOnsModel = mongoose.model('ServiceAddOn', ServiceAddOnsSchema);
export default ServiceAddOnsModel;
