"use strict";
const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const ProductCategory = require("./productCategory.model");
const Category = sequelize.define("Category", {
    shopifyId: {
        type: DataTypes.TEXT,
        allowNull: true,
        unique: true,
    },
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: "categories",
    timestamps: true,
    paranoid: true,
});
Category.hasMany(ProductCategory, {
    as: "products",
    foreignKey: "categoryId",
});
ProductCategory.belongsTo(Category, {
    as: "category",
    foreignKey: "categoryId",
});
module.exports = Category;
//# sourceMappingURL=category.model.js.map