const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  DELIVERY_STATUS,
  SHIPMENTS_STATUS,
} = require("../../../config/constants");
const OrderLine = require("../orderLines/orderline.model");
const Customer = require("../customer/customer.model");
const User = require("../user/user.model");
const Note = require("../notes/notes.model");

const Order = sequelize.define(
  "Order",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      // allowNull: false,
      // unique: true,
    },
    shopifyId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subTotalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
    },
    totalPrice: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    totalDiscounts: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expectedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: ORDER_STATUS.PENDING,
    },
    financialStatus: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    totalCost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
    },
    receivedAmount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    paymentStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    commission: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    totalTax: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    shippingFees: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    PoDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    downPayment: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    toBeCollected: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    itemShipping: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    deliveryStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fine: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    shippedFromInventory: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    custom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    shippingReceiveDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    shippingCompany: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    governorate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipmentStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shipmentType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    totalVendorDue: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    totalCompanyDue: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: 0,
    },
    manufactureStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ["code"],
      },
      {
        fields: ["shopifyId"],
      },
      {
        fields: ["orderNumber"],
      },
      {
        fields: ["customerId"],
      },
      {
        fields: ["userId"],
      },
      {
        fields: ["fine"],
      },
      {
        fields: ["financialStatus"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["paymentStatus"],
      },
      {
        fields: ["deliveryStatus"],
      },
      {
        fields: ["shipmentStatus"],
      },
      // New indexes for query optimization
      {
        fields: ["name"],
      },
      {
        fields: ["number"],
      },
      {
        fields: ["orderDate"],
      },
      {
        fields: ["expectedDeliveryDate"],
      },
      {
        fields: ["custom"],
      },
      {
        fields: ["deletedAt"],
      },
      // Composite indexes for common query patterns
      {
        fields: ["orderDate", "status"],
        name: "order_date_status_idx",
      },
      {
        fields: ["status", "expectedDeliveryDate"],
        name: "status_expected_delivery_idx",
      },
      {
        fields: ["orderDate", "deletedAt"],
        name: "order_date_deleted_at_idx",
      },
    ],
  }
);

Order.hasMany(OrderLine, { as: "orderLines", foreignKey: "orderId" });
OrderLine.belongsTo(Order, { foreignKey: "orderId" });

Order.belongsTo(Customer, { as: "customer", foreignKey: "customerId" });
Customer.hasMany(Order, { foreignKey: "customerId" });

Order.belongsTo(User, { as: "user", foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

Order.hasMany(Note, {
  as: "notesList",
  foreignKey: "entityId",
  constraints: false,
  scope: {
    entityType: "order", // This ensures only notes with entityType='order' are included
  },
});
// Order.sync({ alter: true }).then(() => {
//   console.log("Order table synced");
// });
export = Order;
