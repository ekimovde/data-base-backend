const { Schedule, Audit } = require('../models/models')

class ScheduleController {
  async index(_, res) {
    const schedules = await Schedule.findAll();
    const data = {
      status: "success",
      title: "Получение расписания",
      text: "Все прошло успешно!",
    }

    return res.json({schedules, ...data})
  }

  async create(req, res) {
    const { email: userAudit } = req.user;
    const { doctor, doctorPosition, workingDays, workingHours } = req.body;

    const data = {
      status: "success",
      title: "Добавление расписания",
      text: "Все прошло успешно!",
    };

    let schedule = await Schedule.create({ doctor, doctorPosition, workingDays, workingHours });
    schedule = await Schedule.findOne({ where: { id: schedule.id } });

    await Audit.create({
      table: "Schedule",
      action: "INSERT",
      user: userAudit,
      description: "Добавление расписания",
    });
    return res.json({ schedule, ...data });
  }
}

module.exports = new ScheduleController()