const bcrypt = require("bcrypt");
const _ = require("lodash");

const { User, UserDoctor, UserPatient, Audit } = require("../models/models");
const ApiError = require("../error/ApiError");

class UserController {
  async create(req, res, next) {
    const { email: userAudit } = req.user;
    const { email, password, role } = req.body;
    const data = {
      status: "success",
      title: "Добавление пользователя",
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
    let user = await User.create({ email, password: hashPassword, role });

    if (role === "DOCTOR") {
      const { name } = req.body;
      await UserDoctor.create({ name, userId: user.id });
    }

    if (role === "PATIENT") {
      const { name, age } = req.body;
      await UserPatient.create({ name, age, userId: user.id });
    }

    user = await User.findOne({
      where: { id: user.id },
      include: [{ model: UserDoctor }, { model: UserPatient }],
    });

    await Audit.create({
      table: "User",
      action: "INSERT",
      user: userAudit,
      description: "Регистрация пользователя",
    });
    return res.json({ user, ...data });
  }

  async index(req, res) {
    const { role } = req.user;
    const data = {
      status: "success",
      title: "Загрузка пользователей",
      text: "Все прошло успешно!",
    };

    let users;

    if (role === "ADMIN") {
      users = await User.findAll({
        where: { active: true },
        include: [
          { model: UserDoctor },
          { model: UserPatient, attributes: { exclude: ["name", "disease"] } },
        ],
        attributes: { exclude: ["password"] },
      });
    }

    if (role === "DOCTOR") {
      users = await User.findAll({
        where: { active: true },
        include: [
          { model: UserDoctor },
          { model: UserPatient, attributes: { exclude: ["name"] } },
        ],
        attributes: { exclude: ["password"] },
      });
    }

    if (role === "PATIENT") {
      users = await User.findAll({
        where: { active: true },
        include: [
          { model: UserDoctor, attributes: { exclude: ["name"] } },
          {
            model: UserPatient,
            attributes: { exclude: ["name", "disease", "age"] },
          },
        ],
        attributes: { exclude: ["email", "active", "password"] },
      });
    }

    return res.json({ users, ...data });
  }

  async show(req, res) {
    const { id } = req.user;
    const data = {
      status: "success",
      title: "Профиль",
      text: "Все прошло успешно!",
    };

    const profile = await User.findOne({
      where: { id },
      include: [{ model: UserDoctor }, { model: UserPatient }],
      attributes: { exclude: ["password"] },
    });

    if (_.isEmpty(profile)) {
      data.status = "error";
      data.text = "Пользователь не найден!";

      return res.json({ ...data });
    }

    return res.json({ profile, ...data });
  }

  async update(req, res) {
    const { email: userAudit } = req.user;
    const { id } = req.params;
    const { age, disease } = req.body;
    const data = {
      status: "success",
      title: "Редактирование профиля",
      text: "Все прошло успешно!",
    };

    let user = await UserPatient.update(
      { age, disease },
      { where: { userId: id } }
    );
    user = await User.findOne({
      where: { id },
      include: [{ model: UserDoctor }, { model: UserPatient }],
      attributes: { exclude: ["password"] },
    });

    await Audit.create({
      table: "User",
      action: "UPDATE",
      user: userAudit,
      description: "Редактирование пользователя",
    });
    return res.json({ user, ...data });
  }

  async delete(req, res) {
    const { email: userAudit } = req.user;
    const { id } = req.params;
    const data = {
      status: "success",
      title: "Блокировка профиля",
      text: "Все прошло успешно!",
    };

    await User.update({ active: false }, { where: { id } });
    await Audit.create({
      table: "User",
      action: "DELETE",
      user: userAudit,
      description: "Удаление пользователя",
    });

    return res.json(data);
  }
}

module.exports = new UserController();
