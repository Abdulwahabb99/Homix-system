module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("orders");

    if (!table.priority) {
      await queryInterface.addColumn("orders", "priority", {
        allowNull: false,
        defaultValue: 1,
        type: Sequelize.INTEGER,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("orders");

    if (table.priority) {
      await queryInterface.removeColumn("orders", "priority");
    }
  },
};
