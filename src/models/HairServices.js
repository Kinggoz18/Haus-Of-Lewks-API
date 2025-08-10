import mongoose, { Schema } from 'mongoose';
import HairCategoriesEnum from '../util/enums/HairCategory.js';

const HairAdditionsSchema = new Schema({
  title: { type: String, required: [true, 'Service name is required'] },
  price: { type: Number, required: [true, 'Service price is required'] },
  duration: { type: Number, required: [true, 'Service Duration is required'] }
});

const HairServicesSchema = new Schema({
  title: { type: String, required: [true, 'Service name is required'] },
  price: { type: Number, required: [true, 'Service price is required'] },
  imageLink: {
    type: String,
    validate: {
      validator: function (v) {
        try {
          new URL(v); // use JS URL constructor to validate
          return true;
        } catch (err) {
          return false;
        }
      },
      message: (props) => `${props.value} is not a valid URL!`
    },
    required: [true, 'Image URL is required']
  },
  category: {
    type: String,
    enum: HairCategoriesEnum,
    required: [true, 'Service category is required']
  },
  addOns: { type: [HairAdditionsSchema], default: [] },
  duration: {
    type: Number,
    required: [true, 'Service Duration is required']
  }
});

HairServicesSchema.index({ title: 1, category: 1 }, { unique: true });

const HairServicesModel = mongoose.model('HairService', HairServicesSchema);
export default HairServicesModel;
