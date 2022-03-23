const { Audit } = require("../models/models");

class AuditController {
  async index(_, res) {
    const audits = await Audit.findAll();
    const data = {
      status: "success",
      title: "Получение аудита",
      text: "Все прошло успешно!",
    };

    return res.json({ audits, ...data });
  }
}

module.exports = new AuditController();
