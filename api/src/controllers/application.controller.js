const Application = require("../models/application.model");
const Team = require("../models/team.model");
const User = require("../models/user.model");
const { validateLeader } = require("../utils/authorization");

const createApplication = async (req, res) => {
  try {
    const application = await Application.create(req.body);
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const { team_id, status, sort, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (team_id) {
      filter.team_id = team_id;
    }
    if (status) {
      filter.status = status;
    }
    const team = await Team.findById(team_id);
    if (team && !validateLeader(team.leader_id, req.user.userId)) {
      return res.status(403).json({ message: "Akses ditolak. Anda bukan ketua dari tim ini." });
    }
    const sortOption = sort ? sort.split(",").join(" ") : "createdAt";
    const skip = (Number(page) - 1) * Number(limit);
    const applications = await Application.find(filter)
      .populate('applicant_id', 'name username skills portfolio_link availability_status')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    const team = await Team.findById(application.team_id);
    if (!validateLeader(team.leader_id, req.user.userId)) {
      return res.status(403).json({ message: "Akses ditolak. Anda bukan ketua dari tim ini." });
    }
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true },
    );
    if (req.body.status === "accepted" && application.status !== "accepted") {
      team.members.addToSet(application.applicant_id);

      if (application.role_applied) {
        const roleIndex = team.roles_needed.findIndex(r => r.role === application.role_applied);
        if (roleIndex !== -1 && team.roles_needed[roleIndex].quota > 0) {
          team.roles_needed[roleIndex].quota -= 1;
        }
      }
      await team.save();

      await User.findByIdAndUpdate(application.applicant_id, {
        $addToSet: { joined_teams: application.team_id },
      });
    }
    res.json(updatedApplication);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
};
