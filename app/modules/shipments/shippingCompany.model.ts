const { DataTypes } = require("sequelize");

const { sequelize } = require("../../../src/infrastructure/database");

const ShippingCompany = sequelize.define(
  "ShippingCompany",
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    indexes: [
      {
        fields: ["name"],
        unique: true,
      },
    ],
    paranoid: true,
    tableName: "shippingCompanies",
    timestamps: true,
  },
);

export = ShippingCompany;
