import mongoose, { Schema } from 'mongoose';

const HairCategorySchema = new Schema({
  title: { type: String, required: [true, 'Category name is required'] },
  coverLink: {
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
  }
});

HairCategorySchema.index({ title: 1 }, { unique: true });
const CategoryModel = mongoose.model('HairCategory', HairCategorySchema);
export default CategoryModel;
