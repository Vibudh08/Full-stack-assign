import { InferSchemaType, Model, Schema, model, models } from "mongoose";

const taskSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

taskSchema.index({ userId: 1, createdAt: -1 });

export type TaskDocument = InferSchemaType<typeof taskSchema>;

export const Task =
  (models.Task as Model<TaskDocument>) ||
  model<TaskDocument>("Task", taskSchema);
