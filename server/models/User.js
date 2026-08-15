import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
}, { timestamps: true });

userSchema.set('toJSON', {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

export default model('User', userSchema);
