require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const apiRouter = require("./src/routers/router");
const cors = require("cors");
const app = express();
const APP_HOST = process.env.APP_HOST ?? "http://localhost";
const APP_PORT = process.env.APP_PORT ?? 3000;

connectDB();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", apiRouter);

app.use(express.static(path.join(__dirname, "public-react")));
app.all("*any", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "public-react", "index.html"));
  } catch (error) {
    res.status(404).json({ message: "Endpoint tidak ditemukan" });
  }
});
app.listen(APP_PORT, () => {
  console.log(`Server is running on port ${APP_HOST}:${APP_PORT}`);
});
