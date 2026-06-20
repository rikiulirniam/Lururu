const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    applicant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role_applied: { type: String },
    message: { type: String },
    status: { type: String },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Application", applicationSchema);
