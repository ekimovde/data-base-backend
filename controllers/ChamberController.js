const _ = require("lodash");

const {
  User,
  UserPatient,
  UserDoctor,
  Chamber,
  Audit,
} = require("../models/models");
const ApiError = require("../error/ApiError");

class ChamberController {
  async create(req, res, next) {
    const { email: userAudit } = req.user;
    const { name, email } = req.body;
    const data = {
      status: "success",
      title: "Добавление палаты",
      text: "Все прошло успешно!",
    };

    if (_.isEmpty(email) === false) {
      const candidate = await User.findOne({ where: { email } });

      if (_.isEmpty(candidate)) {
        data.status = "error";
        data.text = "Пациент с таким Email не найден!";

        return next(
          ApiError.badRequest("Пациент с таким Email не найден!", data)
        );
      }

      if (candidate.role !== "PATIENT") {
        data.status = "error";
        data.text = "Пользователь должен иметь роль PATIENT!";

        return next(
          ApiError.badRequest("Пользователь должен иметь роль PATIENT!", data)
        );
      }

      const patient = await UserPatient.findOne({
        where: { userId: candidate.id },
      });
      const candidateChamber = await Chamber.findOne({
        where: { userPatientId: patient.id },
      });

      if (_.isEmpty(candidateChamber)) {
        let chamber = await Chamber.create({ name, userPatientId: patient.id });
        chamber = await Chamber.findOne({
          where: { id: chamber.id },
          include: [{ model: UserPatient }, { model: UserDoctor }],
        });

        await Audit.create({
          table: "Chamber",
          action: "INSERT",
          user: userAudit,
          description: "Создание палаты",
        });
        return res.json({ chamber, ...data });
      } else {
        data.status = "warning";
        data.text = "Данный пациент уже лежит в палате!";

        return next(
          ApiError.badRequest("Данный пациент уже лежит в палате!", data)
        );
      }
    }

    let chamber = await Chamber.create({ name });
    chamber = await Chamber.findOne({
      where: { id: chamber.id },
      include: [{ model: UserPatient }, { model: UserDoctor }],
    });

    await Audit.create({
      table: "Chamber",
      action: "INSERT",
      user: userAudit,
      description: "Создание палаты",
    });
    return res.json({ chamber, ...data });
  }

  async index(req, res) {
    const { id, role } = req.user;
    const data = {
      status: "success",
      title: "Получение палат",
      text: "Все прошло успешно!",
    };

    let chambers;

    if (role === "ADMIN") {
      chambers = await Chamber.findAll({
        where: { active: true },
        include: [{ model: UserPatient }, { model: UserDoctor }],
      });
    }

    if (role === "DOCTOR") {
      chambers = await Chamber.findAll({
        where: { active: true },
        include: [
          { model: UserPatient },
          { model: UserDoctor, where: { userId: id } },
        ],
        attributes: { exclude: ["active", "patient"] },
      });
    }

    if (role === "PATIENT") {
      chambers = await Chamber.findAll({
        where: { active: true },
        include: [
          { model: UserPatient, attributes: [] },
          { model: UserDoctor },
        ],
        attributes: {
          exclude: ["active", "patient", "userPatientId", "userDoctorId"],
        },
      });
    }

    return res.json({ chambers, ...data });
  }

  async update(req, res, next) {
    const { email: userAudit } = req.user;
    const { id } = req.params;
    const { name, email } = req.body;
    const data = {
      status: "success",
      title: "Редактирование палаты",
      text: "Все прошло успешно!",
    };

    if (_.isEmpty(email) === false) {
      const candidate = await User.findOne({ where: { email } });

      if (_.isEmpty(candidate)) {
        data.status = "error";
        data.text = "Пользователь с таким Email не найден!";

        return next(
          ApiError.badRequest("Пользователь с таким Email не найден!", data)
        );
      }

      if (candidate.role !== "PATIENT") {
        data.status = "error";
        data.text = "Пользователь должен иметь роль PATIENT!";

        return next(
          ApiError.badRequest("Пользователь должен иметь роль PATIENT!", data)
        );
      }

      const patient = await UserPatient.findOne({
        where: { userId: candidate.id },
      });
      const candidateChamber = await Chamber.findOne({
        where: { userPatientId: patient.id },
      });

      if (_.isEmpty(candidateChamber)) {
        let chamber = await Chamber.update(
          { name, email, userPatientId: patient.id },
          { where: { id } }
        );
        chamber = await Chamber.findOne({
          where: { id },
          include: [{ model: UserPatient }, { model: UserDoctor }],
        });

        await Audit.create({
          table: "Chamber",
          action: "UPDATE",
          user: userAudit,
          description: "Редактирование палаты",
        });
        return res.json({ chamber, ...data });
      } else {
        data.status = "warning";
        data.text = "Данный пользователь уже лежит в палате!";

        return next(
          ApiError.badRequest("Данный пользователь уже лежит в палате!", data)
        );
      }
    }

    let chamber = await Chamber.update({ name }, { where: { id } });
    chamber = await Chamber.findOne({
      where: { id },
      include: [{ model: UserPatient }, { model: UserDoctor }],
    });

    await Audit.create({
      table: "Chamber",
      action: "UPDATE",
      user: userAudit,
      description: "Редактирование палаты",
    });
    return res.json({ chamber, ...data });
  }

  async delete(req, res) {
    const { email: userAudit } = req.user;
    const { id } = req.params;
    const data = {
      status: "success",
      title: "Удаление палаты",
      text: "Все прошло успешно!",
    };
    const updateData = { userPatientId: null, active: false };

    const candidate = await Chamber.findOne({
      where: { id },
      include: [{ model: UserPatient }, { model: UserDoctor }],
    });

    if (_.isEmpty(candidate.user_patient) === false) {
      const user = await User.findOne({
        where: { id: candidate.user_patient.userId },
      });
      updateData.patient = user.email;
    }

    await Chamber.update(updateData, { where: { id } });
    await Audit.create({
      table: "Chamber",
      action: "DELETE",
      user: userAudit,
      description: "Удаление палаты",
    });

    return res.json({ ...data });
  }

  async doctor(req, res, next) {
    const { email: userAudit } = req.user;
    const { id, email } = req.body;
    const data = {
      status: "success",
      title: "Добавление доктора в палату",
      text: "Все прошло успешно!",
    };

    const candidate = await Chamber.findOne({ where: { id } });
    if (_.isEmpty(candidate)) {
      data.status = "error";
      data.text = "Данная палата не найдена!";

      return next(ApiError.badRequest("Данная палата не найдена!", data));
    }

    const userDoctor = await User.findOne({ where: { email } });
    const candidateDoctor = await UserDoctor.findOne({where: { userId: userDoctor.id }})

    if (_.isEmpty(candidateDoctor)) {
      data.status = "error";
      data.text = "Доктор с таким Email не найден!";

      return next(ApiError.badRequest("Доктор с таким Email не найден!", data));
    }

    if (userDoctor.role !== "DOCTOR") {
      data.status = "warning";
      data.text = "Пользователь с таким Email должен иметь роль DOCTOR!";

      return next(
        ApiError.badRequest(
          "Пользователь с таким Email должен иметь роль DOCTOR!",
          data
        )
      );
    }

    const candidateChamber = await Chamber.findOne({where: { active: true, userDoctorId: candidateDoctor.id }});
    if (_.isEmpty(candidateChamber) === false) {
      data.status = "error";
      data.text = "Доктор с таким Email уже обслуживает палату! 124214124124";

      return next(
        ApiError.badRequest(
          "Доктор с таким Email уже обслуживает палату! 1212412412412",
          data
        )
      );
    }

    await Chamber.update(
      { userDoctorId: candidateDoctor.id },
      { where: { id } }
    );

    const chamber = await Chamber.findOne({
      where: { id },
      include: [{ model: UserPatient }, { model: UserDoctor }],
    });
    await Audit.create({
      table: "Chamber",
      action: "UPDATE",
      user: userAudit,
      description: "Добавление доктора в палату",
    });

    return res.json({ chamber, ...data });
  }
}

module.exports = new ChamberController();
