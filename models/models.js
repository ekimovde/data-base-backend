const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: "USER" },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const UserDoctor = sequelize.define("user_doctor", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
});

const UserPatient = sequelize.define("user_patient", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  age: { type: DataTypes.INTEGER, allowNull: false },
  disease: { type: DataTypes.STRING, allowNull: true },
});

const Chamber = sequelize.define("chamber", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  patient: { type: DataTypes.STRING, defaultValue: null },
});

const Audit = sequelize.define("audit", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  table: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.STRING, allowNull: false },
  user: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
});

const Schedule = sequelize.define('schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  doctor: { type: DataTypes.STRING, allowNull: false },
  doctorPosition: { type: DataTypes.STRING, allowNull: false },
  workingDays: { type: DataTypes.STRING, allowNull: false },
  workingHours: { type: DataTypes.STRING, allowNull: false },
})

User.hasOne(UserDoctor);
UserDoctor.belongsTo(User);

User.hasOne(UserPatient);
UserPatient.belongsTo(User);

UserPatient.hasOne(Chamber);
Chamber.belongsTo(UserPatient);

UserDoctor.hasOne(Chamber);
Chamber.belongsTo(UserDoctor);

module.exports = {
  User,
  UserDoctor,
  UserPatient,
  Chamber,
  Audit,
  Schedule
};
