"use strict";
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const User = require("../user/user.model");
const Vendor = sequelize.define("Vendor", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    daysToDeliver: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: "vendors",
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            fields: ["name"],
        },
        {
            fields: ["deletedAt"],
        },
    ],
});
Vendor.hasOne(User, {
    foreignKey: "vendorId",
    as: "user",
});
module.exports = Vendor;
//# sourceMappingURL=vendor.model.js.map