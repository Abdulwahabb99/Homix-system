const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const Product = require("./product.model");

const ProductType = sequelize.define(
  "ProductType",
  {
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "productsTypes",
    timestamps: true,
    paranoid: true,
  }
);

Product.belongsTo(ProductType, { as: "type", foreignKey: "typeId" });

export = ProductType;
