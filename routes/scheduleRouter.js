const Router = require("express");
const router = new Router();

const ScheduleController = require("../controllers/ScheduleController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

router.get("/", AuthMiddleware, ScheduleController.index);
router.post("/", AuthMiddleware, ScheduleController.create);

module.exports = router;
