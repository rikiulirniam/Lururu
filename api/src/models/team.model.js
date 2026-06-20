const mongoose = require("mongoose");

const roleNeededSchema = new mongoose.Schema(
  {
    role: { type: String },
    required_skills: [{ type: String }],
    quota: { type: Number },
    status: { type: String },
  },
  { _id: false, versionKey: false },
);

const teamSchema = new mongoose.Schema(
  {
    leader_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    title: { type: String, required: true },
    objective: { type: String },
    category: { type: String },
    status: { type: String },
    last_message: { type: String },
    roles_needed: [roleNeededSchema],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Team", teamSchema);
