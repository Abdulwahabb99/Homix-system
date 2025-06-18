const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../config/db.config");

const Log = sequelize.define(
  "Log",
  {
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    field: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "logs",
    timestamps: true,
  }
);
module.exports = Log;
