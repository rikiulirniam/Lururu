const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

const User = require("../models/user.model");
const Team = require("../models/team.model");
const Application = require("../models/application.model");
const Message = require("../models/message.model");

async function seedDatabase() {
  try {
    await connectDB();
    const isFresh = process.argv.includes("fresh");

    if (isFresh) {
      console.log("Flag 'fresh' terdeteksi. Menghapus data lama di database...");
      await User.deleteMany({});
      await Team.deleteMany({});
      await Application.deleteMany({});
      await Message.deleteMany({});
    } else {
      console.log("Menjalankan seeder tanpa menghapus data lama (tambahkan 'fresh' untuk menghapus data).");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const users = await User.insertMany([
      {
        name: "Tirta",
        username: "tirta",
        password: hashedPassword,
        skills: ["React", "Node.js", "Express"],
        portfolio_link: "https://github.com/tirta-dev",
        availability_status: "open",
        joined_teams: [],
      },
      {
        name: "Bima",
        username: "bima",
        password: hashedPassword,
        skills: ["Figma", "UI/UX", "Tailwind"],
        portfolio_link: "https://behance.net/bima-design",
        availability_status: "open",
        joined_teams: [],
      },
    ]);

    const team = await Team.create({
      leader_id: users[0]._id,
      members: [users[0]._id],
      title: "Aplikasi Pendeteksi Hoaks",
      objective: "Membangun sistem AI untuk verifikasi berita lokal",
      category: "ai",
      status: "open",
      last_message: "Selamat datang di tim! Mari kita bahas timeline hackathon.",
      roles_needed: [
        {
          role: "UI/UX Designer",
          required_skills: ["Figma", "Prototyping"],
          quota: 1,
          status: "open",
        },
        {
          role: "Data Scientist",
          required_skills: ["Python", "TensorFlow"],
          quota: 1,
          status: "open",
        },
      ],
    });

    await User.updateOne(
      { _id: users[0]._id },
      { $push: { joined_teams: team._id } }
    );

    await Application.create({
      team_id: team._id,
      applicant_id: users[1]._id,
      role_applied: "UI/UX Designer",
      message: "Saya tertarik bergabung, portofolio saya sesuai dengan kebutuhan tim.",
      status: "pending",
    });

    await Message.create({
      team_id: team._id,
      sender_id: users[0]._id,
      message_text: "Selamat datang di tim! Mari kita bahas timeline hackathon.",
      attachments: [
        {
          file_url: "https://storage.lururu.com/timeline.pdf",
          file_type: "pdf",
        },
      ],
    });

    console.log("Seeding selesai! Username: tirta / bima | Password: password123");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();