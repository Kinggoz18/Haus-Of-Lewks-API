import mongoose, { Schema } from 'mongoose';
import MediaTypeEnum from '../util/enums/MediaType.js';

const MediaSchema = new Schema({
  link: {
    type: String,
    required: [true, 'Media link is required'],
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
    }
  },
  tag: { type: String },
  type: {
    type: String,
    enum: MediaTypeEnum,
    required: [true, 'Media type is required']
  }
});

const MediaModel = mongoose.model('Media', MediaSchema);
export default MediaModel;
