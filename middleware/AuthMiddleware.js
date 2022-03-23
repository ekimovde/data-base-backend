const jwt = require("jsonwebtoken");
const _ = require("lodash");

module.exports = function (req, res, next) {
  if (req.method === "OPTIONS") return next();

  const data = {
    status: "error",
    title: "Проверка авторизации",
    text: "Пользователь не авторизован!",
  };

  try {
    const token = req.headers.authorization.split(" ")[1]; // Bearer token
    if (_.isEmpty(token)) {
      return res
        .status(401)
        .json({ message: "Пользователь не авторизован!", ...data });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Пользователь не авторизован!", ...data });
  }
};
