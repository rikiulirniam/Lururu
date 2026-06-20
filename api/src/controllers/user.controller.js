const User = require("../models/user.model");

const bcrypt = require("bcryptjs")

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, skills, sort, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(",");
      filter.skills = { $all: skillsArray };
    }
    const sortOption = sort ? sort.split(",").join(" ") : "createdAt";
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("joined_teams");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    if (req.params.id !== req.user.userId && req.user.username !== 'superadmin') {
      return res.status(403).json({ message: "Akses ditolak" });
    }


    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true,
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: "Data pengguna tidak ditemukan" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
