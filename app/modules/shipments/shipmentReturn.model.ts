const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");

const ShipmentReturn = sequelize.define(
  "ShipmentReturn",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    returnType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "shipmentReturns",
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ["orderId", "returnType"] },
      { fields: ["status"] },
      { fields: ["returnType"] },
      { fields: ["deletedAt"] },
    ],
  },
);

export = ShipmentReturn;
