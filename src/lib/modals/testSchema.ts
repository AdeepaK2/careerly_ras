import mongoose from "mongoose";

const testSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    default: "MongoDB connection test"
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["success", "error"],
    default: "success"
  }
});

const TestModel = mongoose.models.Test || mongoose.model("Test", testSchema);

export default TestModel;