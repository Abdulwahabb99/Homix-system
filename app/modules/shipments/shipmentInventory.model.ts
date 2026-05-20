const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const Product = require("../product/product.model");

const ShipmentInventoryItem = sequelize.define(
  "ShipmentInventoryItem",
  {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    costPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: "shipmentInventoryItems",
    timestamps: true,
    paranoid: true,
    indexes: [
      { fields: ["productId"] },
      { fields: ["productCode"] },
      { fields: ["status"] },
      { fields: ["deletedAt"] },
    ],
  },
);

ShipmentInventoryItem.belongsTo(Product, {
  as: "product",
  foreignKey: "productId",
});
Product.hasMany(ShipmentInventoryItem, {
  as: "shipmentInventoryItems",
  foreignKey: "productId",
});

export = ShipmentInventoryItem;
