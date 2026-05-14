const { DataTypes } = require("sequelize");

const { sequelize } = require("../../infrastructure/database");

const DashboardDailyMetric = sequelize.define(
  "DashboardDailyMetric",
  {
    activeMakers: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    activeProducts: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    deliveredOrders: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    inProgressOrders: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    metricDate: {
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
    canceledOrRefundedOrders: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    pendingOrders: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
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
        fields: ["metricDate", "role", "scopeId"],
        name: "dashboard_daily_metric_scope_idx",
        unique: true,
      },
      {
        fields: ["vendorId", "metricDate"],
        name: "dashboard_daily_metric_vendor_idx",
      },
    ],
    tableName: "dashboardDailyMetrics",
    timestamps: true,
  },
);

export = DashboardDailyMetric;
