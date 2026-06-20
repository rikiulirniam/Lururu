const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    file_url: { type: String },
    file_type: { type: String },
  },
  { _id: false, versionKey: false },
);

const messageSchema = new mongoose.Schema(
  {
    team_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message_text: { type: String },
    attachments: [attachmentSchema],
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

module.exports = mongoose.model("Message", messageSchema);
