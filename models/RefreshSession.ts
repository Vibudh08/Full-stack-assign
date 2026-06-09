import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const refreshSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export type RefreshSessionDocument = InferSchemaType<
  typeof refreshSessionSchema
>;

export const RefreshSession =
  (models.RefreshSession as Model<RefreshSessionDocument>) ||
  model<RefreshSessionDocument>("RefreshSession", refreshSessionSchema);
