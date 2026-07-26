const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const { FACTORY_STATUS } = require("../../../config/constants");

const Factory = sequelize.define(
  "Factory",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    factoryCategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPersonName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPersonPhoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPersonEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contactPersonRole: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    joinDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    cairoGizaShipping: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    otherCitiesShipping: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountHolderName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bankAccountNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    walletNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    walletProvider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    instapayNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "factories",
    timestamps: true,
    paranoid: true,
  }
);

export = Factory;
