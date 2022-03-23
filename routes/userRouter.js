const Router = require("express");
const router = new Router();

const UserController = require("../controllers/UserController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

router.post("/", AuthMiddleware, UserController.create);
router.get("/", AuthMiddleware, UserController.index);
router.put("/:id", AuthMiddleware, UserController.update);
router.delete("/:id", AuthMiddleware, UserController.delete);
router.get("/profile", AuthMiddleware, UserController.show);

module.exports = router;
