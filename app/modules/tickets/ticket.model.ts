const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const Order = require("../order/order.model");
const User = require("../user/user.model");
const Note = require("../notes/notes.model");
const Attachment = require("../attachments/attachment.model");

const Ticket = sequelize.define(
  "Ticket",
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    assignedToUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdByUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    closedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ["orderId"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["type"],
      },
      {
        fields: ["assignedToUserId"],
      },
      {
        fields: ["createdByUserId"],
      },
      {
        fields: ["createdAt"],
      },
    ],
  },
);

Ticket.belongsTo(Order, {
  as: "linkedOrder",
  constraints: true,
  foreignKey: "orderId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Order.hasMany(Ticket, {
  as: "tickets",
  constraints: true,
  foreignKey: "orderId",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Ticket.belongsTo(User, {
  as: "assignee",
  constraints: true,
  foreignKey: "assignedToUserId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});
Ticket.belongsTo(User, {
  as: "creator",
  constraints: true,
  foreignKey: "createdByUserId",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

Ticket.hasMany(Note, {
  as: "notesList",
  constraints: false,
  foreignKey: "entityId",
  scope: {
    entityType: "ticket",
  },
});

Ticket.hasMany(Attachment, {
  as: "attachments",
  constraints: false,
  foreignKey: "modelId",
  scope: {
    modelType: "Ticket",
  },
});

export = Ticket;
