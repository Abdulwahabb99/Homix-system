const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const Factory = require("../factory/factory.model");
const Note = require("../notes/notes.model");

const Attachment = sequelize.define(
  "Attachment",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachmentType: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    issuedAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    modelType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "attachments",
    timestamps: true,
    paranoid: true,
  }
);

Factory.hasMany(Attachment, {
  foreignKey: "modelId",
  constraints: false,
  scope: {
    modelType: "Factory",
  },
  as: "attachments",
});
Note.hasMany(Attachment, {
  foreignKey: "modelId",
  constraints: false,
  scope: {
    modelType: "Note",
  },
  as: "attachments",
});
export = Attachment;
