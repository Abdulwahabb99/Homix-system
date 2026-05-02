const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");

const ProductCategory = sequelize.define(
  "ProductCategory",
  {
    shopifyId: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "productsCategories",
  }
);


export = ProductCategory;
