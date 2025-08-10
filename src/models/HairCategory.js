import mongoose, { Schema } from 'mongoose';

const HairCategorySchema = new Schema({
  name: { type: String, required: [true, 'Category name is required'] }
});

const CategoryModel = new mongoose.model('HairCategory', HairCategorySchema);
export default CategoryModel;
