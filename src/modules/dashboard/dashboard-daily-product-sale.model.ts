const { DataTypes } = require("sequelize");

const { sequelize } = require("../../infrastructure/database");

const DashboardDailyProductSale = sequelize.define(
  "DashboardDailyProductSale",
  {
    metricDate: {
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
    productId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    productTitle: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    totalOrders: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    totalQuantity: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    totalSales: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.DECIMAL(14, 2),
    },
    vendorId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [
      {
        fields: ["metricDate", "vendorId", "productId"],
        name: "dashboard_daily_product_sale_scope_idx",
        unique: true,
      },
      {
        fields: ["vendorId", "metricDate"],
        name: "dashboard_daily_product_sale_vendor_idx",
      },
    ],
    tableName: "dashboardDailyProductSales",
    timestamps: true,
  },
);

export = DashboardDailyProductSale;
