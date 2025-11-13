import mongoose from "mongoose";

const treningSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "postponed"],
      default: "active",
    },
    trainer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    capacity: { type: Number },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Trening", treningSchema);
