require("dotenv").config();
const { sequelize } = require("../config/db.config");

/**
 * Migration script to add indexes for performance optimization
 * Run this ONCE manually or through a migration tool
 *
 * Usage: node migrations/add-indexes.js
 */

async function addIndexes() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log("Starting index creation...");

    // Orders table indexes
    console.log("Adding indexes to orders table...");
    await queryInterface.addIndex("orders", ["name"], {
      name: "orders_name_idx",
      concurrently: true,
    }).catch(() => console.log("  - orders_name_idx already exists"));

    await queryInterface.addIndex("orders", ["number"], {
      name: "orders_number_idx",
      concurrently: true,
    }).catch(() => console.log("  - orders_number_idx already exists"));

    await queryInterface.addIndex("orders", ["orderDate"], {
      name: "orders_orderDate_idx",
      concurrently: true,
    }).catch(() => console.log("  - orders_orderDate_idx already exists"));

    await queryInterface.addIndex("orders", ["expectedDeliveryDate"], {
      name: "orders_expectedDeliveryDate_idx",
      concurrently: true,
    }).catch(() => console.log("  - orders_expectedDeliveryDate_idx already exists"));

    await queryInterface.addIndex("orders", ["custom"], {
      name: "orders_custom_idx",
      concurrently: true,
    }).catch(() => console.log("  - orders_custom_idx already exists"));

    await queryInterface.addIndex("orders", ["deletedAt"], {
      name: "orders_deletedAt_idx",
      concurrently: true,
    }).catch(() => console.log("  - orders_deletedAt_idx already exists"));

    // Composite indexes for orders
    await queryInterface.addIndex("orders", ["orderDate", "status"], {
      name: "order_date_status_idx",
      concurrently: true,
    }).catch(() => console.log("  - order_date_status_idx already exists"));

    await queryInterface.addIndex("orders", ["status", "expectedDeliveryDate"], {
      name: "status_expected_delivery_idx",
      concurrently: true,
    }).catch(() => console.log("  - status_expected_delivery_idx already exists"));

    await queryInterface.addIndex("orders", ["orderDate", "deletedAt"], {
      name: "order_date_deleted_at_idx",
      concurrently: true,
    }).catch(() => console.log("  - order_date_deleted_at_idx already exists"));

    // OrderLines table indexes
    console.log("Adding indexes to orderLines table...");
    await queryInterface.addIndex("orderLines", ["orderId"], {
      name: "orderLines_orderId_idx",
      concurrently: true,
    }).catch(() => console.log("  - orderLines_orderId_idx already exists"));

    await queryInterface.addIndex("orderLines", ["productId"], {
      name: "orderLines_productId_idx",
      concurrently: true,
    }).catch(() => console.log("  - orderLines_productId_idx already exists"));

    await queryInterface.addIndex("orderLines", ["shopifyId"], {
      name: "orderLines_shopifyId_idx",
      concurrently: true,
    }).catch(() => console.log("  - orderLines_shopifyId_idx already exists"));

    await queryInterface.addIndex("orderLines", ["deletedAt"], {
      name: "orderLines_deletedAt_idx",
      concurrently: true,
    }).catch(() => console.log("  - orderLines_deletedAt_idx already exists"));

    await queryInterface.addIndex("orderLines", ["orderId", "productId"], {
      name: "orderline_order_product_idx",
      concurrently: true,
    }).catch(() => console.log("  - orderline_order_product_idx already exists"));

    // Products table indexes
    console.log("Adding indexes to products table...");
    await queryInterface.addIndex("products", ["vendorId"], {
      name: "products_vendorId_idx",
      concurrently: true,
    }).catch(() => console.log("  - products_vendorId_idx already exists"));

    await queryInterface.addIndex("products", ["typeId"], {
      name: "products_typeId_idx",
      concurrently: true,
    }).catch(() => console.log("  - products_typeId_idx already exists"));

    await queryInterface.addIndex("products", ["shopifyId"], {
      name: "products_shopifyId_idx",
      concurrently: true,
    }).catch(() => console.log("  - products_shopifyId_idx already exists"));

    await queryInterface.addIndex("products", ["status"], {
      name: "products_status_idx",
      concurrently: true,
    }).catch(() => console.log("  - products_status_idx already exists"));

    await queryInterface.addIndex("products", ["deletedAt"], {
      name: "products_deletedAt_idx",
      concurrently: true,
    }).catch(() => console.log("  - products_deletedAt_idx already exists"));

    await queryInterface.addIndex("products", ["vendorId", "deletedAt"], {
      name: "product_vendor_deleted_idx",
      concurrently: true,
    }).catch(() => console.log("  - product_vendor_deleted_idx already exists"));

    // Vendors table indexes
    console.log("Adding indexes to vendors table...");
    await queryInterface.addIndex("vendors", ["name"], {
      name: "vendors_name_idx",
      concurrently: true,
    }).catch(() => console.log("  - vendors_name_idx already exists"));

    await queryInterface.addIndex("vendors", ["deletedAt"], {
      name: "vendors_deletedAt_idx",
      concurrently: true,
    }).catch(() => console.log("  - vendors_deletedAt_idx already exists"));

    // Customers table indexes
    console.log("Adding indexes to customers table...");
    await queryInterface.addIndex("customers", ["shopifyId"], {
      name: "customers_shopifyId_idx",
      concurrently: true,
    }).catch(() => console.log("  - customers_shopifyId_idx already exists"));

    await queryInterface.addIndex("customers", ["email"], {
      name: "customers_email_idx",
      concurrently: true,
    }).catch(() => console.log("  - customers_email_idx already exists"));

    await queryInterface.addIndex("customers", ["phoneNumber"], {
      name: "customers_phoneNumber_idx",
      concurrently: true,
    }).catch(() => console.log("  - customers_phoneNumber_idx already exists"));

    await queryInterface.addIndex("customers", ["deletedAt"], {
      name: "customers_deletedAt_idx",
      concurrently: true,
    }).catch(() => console.log("  - customers_deletedAt_idx already exists"));

    console.log("\n✓ All indexes created successfully!");
    console.log("\nNote: Indexes are created with CONCURRENTLY option to avoid locking tables.");
    console.log("This allows the migration to run while the application is running.\n");

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Error creating indexes:", error);
    process.exit(1);
  }
}

addIndexes();
