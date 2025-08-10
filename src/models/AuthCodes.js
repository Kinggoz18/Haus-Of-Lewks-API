import mongoose from 'mongoose';

const codeSchema = new mongoose.Schema({
  code: { type: String },
  expiryDate: { type: Date }
});

const authCodeSchema = new mongoose.Schema(
  {
    userId: {
      type: String
    },

    //======={for verification}=============
    refreshToken: codeSchema,
    atExpiresAt: { type: Date },
    rtExpiresAt: { type: Date }
  },
  { timestamps: true }
);

const AuthCodeModel = mongoose.model('AuthCodes', authCodeSchema);
export default AuthCodeModel;
