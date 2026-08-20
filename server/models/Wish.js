import { Schema, model } from "mongoose";

const wishSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    status: {
      type: String,
      enum: ["active", "in_progress", "completed"],
      default: "active",
    },
    deadline: { type: Date, default: null },
    image: { type: String, default: null },
  },
  { timestamps: true },
);

wishSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default model("Wish", wishSchema);
