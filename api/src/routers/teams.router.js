const router = require("express").Router();
const controller = require("../controllers/team.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/", controller.createTeam);
router.get("/", controller.getTeams);
router.get("/:id", controller.getTeamById);
router.put("/:id", controller.updateTeam);
router.delete("/:id", controller.deleteTeam);

module.exports = router;
