const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    skills: [{ type: String }],
    portfolio_link: { type: String },
    availability_status: { type: String },
    joined_teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
