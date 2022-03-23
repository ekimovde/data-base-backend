const Router = require("express");
const router = new Router();

const ChamberController = require("../controllers/ChamberController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

router.post("/", AuthMiddleware, ChamberController.create);
router.get("/", AuthMiddleware, ChamberController.index);
router.put("/:id", AuthMiddleware, ChamberController.update);
router.delete("/:id", AuthMiddleware, ChamberController.delete);
router.post("/doctor", AuthMiddleware, ChamberController.doctor);

module.exports = router;
