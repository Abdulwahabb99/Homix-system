const { DataTypes } = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");

const ManagedOption = sequelize.define("ManagedOption", {
  optionGroup: { allowNull: false, type: DataTypes.STRING },
  optionId: { allowNull: false, type: DataTypes.INTEGER },
  label: { allowNull: false, type: DataTypes.STRING },
  sortOrder: { allowNull: false, defaultValue: 0, type: DataTypes.INTEGER },
  active: { allowNull: false, defaultValue: true, type: DataTypes.BOOLEAN },
}, {
  tableName: "managedOptions",
  timestamps: true,
  indexes: [
    { fields: ["optionGroup", "optionId"], name: "managed_options_group_id_idx", unique: true },
    { fields: ["optionGroup", "active", "sortOrder"], name: "managed_options_group_active_sort_idx" },
  ],
});

export = ManagedOption;
