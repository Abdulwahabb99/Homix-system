const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");

const ShipmentExpense = sequelize.define(
  "ShipmentExpense",
  {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    accountingStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    accountingDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "shipmentExpenses",
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ["type"] },
      { fields: ["accountingStatus"] },
      { fields: ["accountingDate"] },
      { fields: ["deletedAt"] },
    ],
  },
);

export = ShipmentExpense;
