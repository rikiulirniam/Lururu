const { verifyToken } = require("../middleware/auth");
const path = require("path");
const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.router"));
router.use("/users", verifyToken, require("./users.router"));
router.use("/teams", verifyToken, require("./teams.router"));
router.use("/applications", verifyToken, require("./applications.router"));
router.use("/messages", verifyToken, require("./messages.router"));
router.use('/uploads/files', express.static(path.join(__dirname, '../../uploads')));
router.use("/uploads", verifyToken, require("./upload.router"));
module.exports = router;
