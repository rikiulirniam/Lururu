const Message = require("../models/message.model");

const createMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const {
      team_id,
      startDate,
      endDate,
      sort,
      page = 1,
      limit = 10,
    } = req.query;
    const filter = {};
    if (team_id) {
      filter.team_id = team_id;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const sortOption = sort ? sort.split(",").join(" ") : "createdAt";
    const skip = (Number(page) - 1) * Number(limit);
    const messages = await Message.find(filter)
      .populate('sender_id', 'name username')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMessage = async (req, res) => {
  try {
    const updateData = {};
    if (req.body.message_text !== undefined) {
      updateData.message_text = req.body.message_text;
    }
    const message = await Message.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
};
