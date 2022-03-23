const Router = require("express");
const router = new Router();

const AuditController = require("../controllers/AuditController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

router.get("/", AuthMiddleware, AuditController.index);

module.exports = router;
