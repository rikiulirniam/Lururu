const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const {name,username,password,skills,portfolio_link,availability_status,} = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
      skills: skills || [],
      portfolio_link: portfolio_link || "",
      availability_status: availability_status || "open",
      joined_teams: [],
    });

    await newUser.save();

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "Registrasi berhasil",
      user: userResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username dan password diperlukan" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Username atau password tidak valid" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Username atau password tidak valid" });
    }

    const secretKey = process.env.JWT_SECRET || "rahasia_jwt_super_aman";
    const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, {
      expiresIn: "1d",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login berhasil",
      token: token,
      user: userResponse,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Terjadi kesalahan pada server",
        error: error.message,
      });
  }
};


module.exports = {
  register,
  login,
};
