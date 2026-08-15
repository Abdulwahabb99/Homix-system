const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const User = require("../user/user.model");
const Vendor = sequelize.define(
  "Vendor",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    daysToDeliver: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    accountManagerUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "vendors",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ["name"],
      },
      {
        fields: ["accountManagerUserId"],
      },
      {
        fields: ["deletedAt"],
      },
    ],
  }
);

Vendor.hasOne(User, {
  foreignKey: "vendorId",
  as: "user",
});

Vendor.belongsTo(User, {
  foreignKey: "accountManagerUserId",
  as: "accountManager",
});


export = Vendor;
