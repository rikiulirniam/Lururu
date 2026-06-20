const router = require("express").Router();
const controller = require("../controllers/application.controller");

router.post("/", controller.createApplication);
router.get("/", controller.getApplications);
router.get("/:id", controller.getApplicationById);
router.put("/:id", controller.updateApplication);
router.delete("/:id", controller.deleteApplication);

module.exports = router;
