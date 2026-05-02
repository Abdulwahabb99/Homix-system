const { DataTypes } = require("sequelize");

const { sequelize } = require("../../infrastructure/database");

const DashboardDailyCategorySale = sequelize.define(
  "DashboardDailyCategorySale",
  {
    categoryId: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    categoryTitle: {
      allowNull: false,
      type: DataTypes.TEXT,
    },
    metricDate: {
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
    role: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    scopeId: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
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
      allowNull: true,
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [
      {
        fields: ["metricDate", "role", "scopeId", "categoryId"],
        name: "dashboard_daily_category_sale_scope_idx",
        unique: true,
      },
      {
        fields: ["vendorId", "metricDate"],
        name: "dashboard_daily_category_sale_vendor_idx",
      },
    ],
    tableName: "dashboardDailyCategorySales",
    timestamps: true,
  },
);

export = DashboardDailyCategorySale;
