import mongoose, { Schema } from 'mongoose';
import MediaTypeEnum from '../util/enums/MediaType.js';

const MediaSchema = new Schema({
  link: { type: URL, required: [true, 'Media link is required'] },
  type: {
    type: String,
    enum: MediaTypeEnum,
    required: [true, 'Media type is required']
  }
});

const MediaModel = mongoose.model('Media', MediaSchema);
export default MediaModel;
