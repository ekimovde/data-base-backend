const jwt = require("jsonwebtoken");
const _ = require("lodash");

module.exports = function (role) {
  return function (req, res, next) {
    if (req.method === "OPTIONS") return next();

    try {
      const token = req.headers.authorization.split(" ")[1]; // Bearer token
      if (_.isEmpty(token))
        return res.status(401).json("Пользователь не авторизован!");

      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      if (decoded.role !== role) return res.status(403).json("Нет доступа!");

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json("Пользователь не авторизован!");
    }
  };
};
