const Team = require("../models/team.model");
const { validateLeader } = require("../utils/authorization");

const createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const { search, category, status, sort, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    const sortOption = sort ? sort.split(",").join(" ") : "createdAt";
    const skip = (Number(page) - 1) * Number(limit);
    const teams = await Team.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("leader_id")
      .populate("members");
    if (!team) return res.status(404).json({ message: "Team not found" });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const existingTeam = await Team.findById(req.params.id);
    if (!existingTeam) return res.status(404).json({ message: "Team not found" });
    if (!validateLeader(existingTeam.leader_id, req.user.userId)) {
      return res.status(403).json({ message: "Akses ditolak. Anda bukan ketua dari tim ini." });
    }

    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).populate("leader_id").populate("members");
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    const existingTeam = await Team.findById(req.params.id);
    if (!existingTeam) return res.status(404).json({ message: "Team not found" });
    if (!validateLeader(existingTeam.leader_id, req.user.userId)) {
      return res.status(403).json({ message: "Akses ditolak. Anda bukan ketua dari tim ini." });
    }

    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
};
