const router = require("express").Router();
const controller = require("../controllers/message.controller");

router.post("/", controller.createMessage);
router.get("/", controller.getMessages);
router.get("/:id", controller.getMessageById);
router.put("/:id", controller.updateMessage);
router.delete("/:id", controller.deleteMessage);

module.exports = router;
