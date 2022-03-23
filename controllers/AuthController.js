const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const { User, UserDoctor, UserPatient, Audit } = require("../models/models");
const ApiError = require("../error/ApiError");

const generateJwt = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class AuthController {
  async registration(req, res, next) {
    const { email, password, role } = req.body;
    const data = {
      status: "success",
      title: "Регистрация",
      text: "Все прошло успешно!",
    };

    if (_.isEmpty(email) && _.isEmpty(password)) {
      data.status = "error";
      data.text = "Некорректный Email или пароль!";

      return next(ApiError.badRequest("Некорректный Email или пароль!", data));
    }

    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      data.status = "error";
      data.text = "Пользователь с таким Email уже существует!";

      return next(
        ApiError.badRequest("Пользователь с таким Email уже существует!", data)
      );
    }

    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ email, password: hashPassword, role });

    if (role === "DOCTOR") {
      const { name } = req.body;
      await UserDoctor.create({ name, userId: user.id });
    }

    if (role === "PATIENT") {
      const { name, age } = req.body;
      await UserPatient.create({ name, age, userId: user.id });
    }

    await Audit.create({
      table: "User",
      action: "INSERT",
      user: email,
      description: "Регистрация пользователя",
    });

    const token = generateJwt(user.id, email, user.role);
    return res.json({ token, ...data });
  }

  async login(req, res, next) {
    const { email, password } = req.body;
    const data = {
      status: "success",
      title: "Авторизация",
      text: "Все прошло успешно!",
    };

    const user = await User.findOne({ where: { email } });

    if (_.isEmpty(user)) {
      data.status = "warning";
      data.text = "Пользователь не найден!";

      return next(ApiError.internal("Пользователь не найден!", data));
    }

    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      data.status = "error";
      data.text = "Неверный пароль!";

      return next(ApiError.internal("Неверный пароль!", data));
    }

    const token = generateJwt(user.id, email, user.role);
    return res.json({ token, ...data });
  }

  async check(req, res) {
    const { id, email, role } = req.user;
    const data = {
      status: "success",
      title: "Проверка авторизации",
      text: "Все прошло успешно!",
    };
    const token = generateJwt(id, email, role);

    if (_.isEmpty(token)) {
      data.status = "error";
      data.text = "Пользователь не авторизован!";

      return res.json({ ...data });
    }

    return res.json({ token, ...data });
  }
}

module.exports = new AuthController();
