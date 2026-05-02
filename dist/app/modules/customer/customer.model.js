"use strict";
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const Customer = sequelize.define("Customer", {
    firstName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lastName: {
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
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    address2: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shopifyId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "customers",
    timestamps: true,
    paranoid: true,
    indexes: [
        {
            fields: ["shopifyId"],
        },
        {
            fields: ["email"],
        },
        {
            fields: ["phoneNumber"],
        },
        {
            fields: ["deletedAt"],
        },
    ],
});
module.exports = Customer;
//# sourceMappingURL=customer.model.js.map