const Router = require("express");
const router = new Router();

const authRouter = require("./authRouter");
const userRouter = require("./userRouter");
const chamberRouter = require("./chamberRouter");
const auditRouter = require("./auditRouter");
const scheduleRouter = require("./scheduleRouter");

router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/chamber", chamberRouter);
router.use("/audit", auditRouter);
router.use("/schedule", scheduleRouter);

module.exports = router;
