"use strict";
// const { Op, literal } = require("sequelize");
// const Order = require("../app/modules/order/order.model");
// const { importOrders } = require("../app/modules/order/order.service");
// const { PAYMENT_STATUS } = require("./constants");
// const ProductsService = require("../app/modules/product/product.service");
// const CustomerService = require("../app/modules/customer/customer.service");
// const PREFIX = "H";
// const CUSTOM_PREFIX = "CU";
// const isShipment = false;
// const moment = require("moment");
// const OrderLine = require("../app/modules/orderLines/orderline.model");
// const getDuplicatedOrders = async () => {
// //   const allOrders = await importOrders({
// //     created_at_min: "2025-05-23T00:00:00Z",
// //   });
// //   console.log("All Orders:");
//   //   const ordersMap = {};
//   //   const orderDates = {};
//   //   const ordersMapData = {};
//   //   for (const orderFromShopify of allOrders) {
//   //     let orders = [];
//   //     let orderCount = 0;
//   //     if (orderFromShopify.line_items.length > 1) {
//   //       for (const line of orderFromShopify.line_items) {
//   //         if (line.quantity > 1) {
//   //           const discount_allocations = line.discount_allocations || [];
//   //           const lineDiscount = discount_allocations.reduce(
//   //             (acc, item) => acc + Number(item.amount),
//   //             0
//   //           );
//   //           const discount = lineDiscount / line.quantity;
//   //           //split line into multiple lines with quantity 1
//   //           for (let i = 0; i < line.quantity; i++) {
//   //             const newLine = { ...line, quantity: 1 };
//   //             newLine.discount = discount;
//   //             orderCount++;
//   //             orders.push({
//   //               ...orderFromShopify,
//   //               line_items: [newLine],
//   //             });
//   //           }
//   //         } else {
//   //           const discount_allocations = line.discount_allocations || [];
//   //           const lineDiscount = discount_allocations.reduce(
//   //             (acc, item) => acc + Number(item.amount),
//   //             0
//   //           );
//   //           const discount = lineDiscount;
//   //           line.discount = discount;
//   //           orderCount++;
//   //           orders.push({
//   //             ...orderFromShopify,
//   //             line_items: [line],
//   //           });
//   //         }
//   //       }
//   //     } else {
//   //       const line = orderFromShopify.line_items[0];
//   //       const discount_allocations = line.discount_allocations || [];
//   //       const lineDiscount = discount_allocations.reduce(
//   //         (acc, item) => acc + Number(item.amount),
//   //         0
//   //       );
//   //       if (line.quantity > 1) {
//   //         const discount = lineDiscount / line.quantity;
//   //         //split line into multiple lines with quantity 1
//   //         for (let i = 0; i < line.quantity; i++) {
//   //           const newLine = { ...line, quantity: 1 };
//   //           newLine.discount = discount;
//   //           orderCount++;
//   //           orders.push({
//   //             ...orderFromShopify,
//   //             line_items: [newLine],
//   //           });
//   //         }
//   //       } else {
//   //         const discount = lineDiscount;
//   //         line.discount = discount;
//   //         orderCount++;
//   //         orders.push({
//   //           ...orderFromShopify,
//   //           line_items: [line],
//   //         });
//   //       }
//   //     }
//   //     ordersMap[orderFromShopify.name] = orderCount;
//   //     orderDates[orderFromShopify.name] = orderFromShopify.created_at;
//   //     ordersMapData[orderFromShopify.name] = orderFromShopify.id;
//   //   }
//   //   const ordersFromDatabase = await Order.findAll({
//   //     where: {
//   //       orderDate: {
//   //         [Op.gte]: new Date("2025-05-23T00:00:00Z"),
//   //       },
//   //     },
//   //     attributes: ["name"],
//   //   });
//   //   const ordersFromDatabaseMap = {};
//   //   for (const order of ordersFromDatabase) {
//   //     if (!ordersFromDatabaseMap[order.name]) {
//   //       ordersFromDatabaseMap[order.name] = 0;
//   //     }
//   //     ordersFromDatabaseMap[order.name]++;
//   //   }
//   //   const duplicatedOrders = [];
//   //   const duplicatedOrdersMap = {};
//   //   const ids=[]
//   //   for (const orderName in ordersMap) {
//   //     if (!ordersFromDatabaseMap[orderName]) {
//   //       if (ordersFromDatabaseMap[orderName] !== ordersMap[orderName]) {
//   //         duplicatedOrdersMap[orderName] = ordersMapData[orderName];
//   //         ids.push(ordersMapData[orderName]);
//   //         duplicatedOrders.push({
//   //           name: orderName,
//   //           shopifyCount: ordersMap[orderName],
//   //           databaseCount: ordersFromDatabaseMap[orderName],
//   //           orderDate: orderDates[orderName],
//   //         });
//   //       }
//   //     }
//   //   }
//   //   console.log("Duplicated Orders:");
//   //   for (const order of duplicatedOrders) {
//   //     let shopifyOrders = duplicatedOrdersMap[order.name];
//   //     const productsIds = new Set();
//   //     const customers = [];
//   //     const lastOrder = await Order.findOne({
//   //       where: {
//   //         code: {
//   //           [Op.not]: null,
//   //         },
//   //       },
//   //       order: [[literal('CAST("code" AS INTEGER)'), "DESC"]],
//   //       attributes: ["code"],
//   //     });
//   //     const lastCustomOrder = await Order.findOne({
//   //       where: {
//   //         code: {
//   //           [Op.not]: null,
//   //         },
//   //         custom: true,
//   //       },
//   //       order: [[literal('CAST("code" AS INTEGER)'), "DESC"]],
//   //       attributes: ["number"],
//   //     });
//   //     // Get last code number or default to 0
//   //     const lastCode = lastOrder?.code || `0`;
//   //     const codeNumber = parseInt(lastCode.replace(PREFIX, ""), 10);
//   //     // Get last custom code number or default to 0
//   //     let lastCustomNumber = lastCustomOrder ? lastCustomOrder.number : 0;
//   //     if (isNaN(codeNumber)) {
//   //       throw new Error("Invalid order code format");
//   //     }
//   //     let nextNumber = codeNumber + 1;
//   //     for (const order of shopifyOrders) {
//   //       for (const line of order.line_items) {
//   //         if (line.product_id) {
//   //           productsIds.add(String(line.product_id));
//   //         }
//   //       }
//   //       if (order.customer) {
//   //         customers.push(order.customer);
//   //       }
//   //     }
//   //     const [{ productsMap, vendorsMap }, customersNamesMap] = await Promise.all([
//   //       ProductsService.getProductsMappedByShopifyIds([...productsIds]),
//   //       CustomerService.getCustomersMappedByNames(customers),
//   //     ]);
//   //     const lines = [];
//   //     shopifyOrders = shopifyOrders
//   //       .filter((order) => order.customer)
//   //       .map((order) => {
//   //         const line = order.line_items[0];
//   //         const product = line.product_id
//   //           ? productsMap[line.product_id]
//   //           : productsMap["custom"];
//   //         if (!product) {
//   //           throw new Error(
//   //             `Product with id ${line.product_id} not found in products map`
//   //           );
//   //         }
//   //         const vendor = vendorsMap[product.vendorId];
//   //         const paymentStatus =
//   //           order.financial_status === "paid"
//   //             ? PAYMENT_STATUS.PAID
//   //             : PAYMENT_STATUS.COD;
//   //         let totalCost = 0;
//   //         let totalPrice = 0;
//   //         let subTotalPrice = 0;
//   //         let total_discounts = 0;
//   //         order.line_items.forEach((line) => {
//   //           const variant = product.variants
//   //             ? product.variants.find(
//   //                 (variant) =>
//   //                   variant.shopifyId.toString() === line.variant_id.toString()
//   //               )
//   //             : null;
//   //           const cost = variant ? Number(variant.cost) || 0 : 0;
//   //           line.unitCost = cost;
//   //           line.cost = cost * line.quantity;
//   //           totalCost += line.cost;
//   //           subTotalPrice = line.price * line.quantity;
//   //           total_discounts += line.discount || 0;
//   //         });
//   //         const customerKey = order.id
//   //           ? order.customer.id
//   //           : `${
//   //               order.customer.firstName ||
//   //               order.customer.first_name ||
//   //               order.customer.default_address.first_name
//   //             }${
//   //               order.customer.lastName ||
//   //               order.customer.last_name ||
//   //               order.customer.default_address.last_name
//   //             }${
//   //               order.customer.email ||
//   //               order.customer.default_address?.email ||
//   //               ""
//   //             }${
//   //               order.customer.phone ||
//   //               order.customer.default_address?.phone ||
//   //               ""
//   //             }`;
//   //         let number,
//   //           orderNumber,
//   //           name,
//   //           custom = false;
//   //         if (order.id) {
//   //           number = order.number;
//   //           orderNumber = order.order_number;
//   //           name = order.name;
//   //         } else {
//   //           const newNumber = parseInt(lastCustomNumber) + 1;
//   //           number = `${newNumber}`;
//   //           orderNumber = `${newNumber + 1000}`;
//   //           name = `#${CUSTOM_PREFIX}${newNumber}`;
//   //           custom = true;
//   //         }
//   //         const codeNumber = nextNumber;
//   //         nextNumber++;
//   //         let obj = {
//   //           shopifyId: String(order.id),
//   //           name,
//   //           code: codeNumber,
//   //           number,
//   //           orderNumber,
//   //           subTotalPrice: subTotalPrice,
//   //           totalDiscounts: total_discounts,
//   //           totalTax: order.total_tax,
//   //           totalPrice: subTotalPrice - total_discounts,
//   //           orderDate: order.created_at || new Date(),
//   //           customerId: customersNamesMap[customerKey],
//   //           totalCost,
//   //           custom,
//   //           shippedFromInventory: isShipment ? true : false,
//   //           shippingReceiveDate: order.shippingReceiveDate || null,
//   //           shippingCompany: order.shippingCompany || null,
//   //           deliveryDate: order.deliveryDate || null,
//   //           governorate: order.governorate || null,
//   //           shipmentStatus: order.shipmentStatus || null,
//   //           shipmentType: order.shipmentType || null,
//   //           expectedDate: order.expectedDate || null,
//   //           expectedDeliveryDate: vendor.daysToDeliver
//   //             ? moment().add(vendor.daysToDeliver, "days").toDate()
//   //             : null,
//   //           receivedAmount: order.receivedAmount || 0,
//   //           commission: order.commission || 0,
//   //           shippingFees: order.shippingFees || 0,
//   //           PoDate: order.PoDate || null,
//   //           downPayment: order.downPayment || 0,
//   //           toBeCollected: order.toBeCollected || 0,
//   //           itemShipping: order.itemShipping || 0,
//   //           deliveryStatus: order.deliveryStatus || null,
//   //           userId: order.userId || null,
//   //         };
//   //         // status: order.status || null,
//   //         // financialStatus: order.financial_status || null,
//   //         // paymentStatus: order.paymentStatus || null,
//   //         lines.push({
//   //           order_id: obj.code,
//   //           line_items: order.line_items,
//   //         });
//   //         if (obj.status) {
//   //           obj.status = order.status;
//   //         }
//   //         if (order.financialStatus) {
//   //           obj.financialStatus = order.financialStatus;
//   //         }
//   //         if (order.paymentStatus) {
//   //           obj.paymentStatus = order.paymentStatus;
//   //         } else {
//   //           obj.paymentStatus = paymentStatus;
//   //         }
//   //         return obj;
//   //       });
//   //     let ordersOfOrder = await Order.findAll({
//   //       where: {
//   //         name: order.name,
//   //       },
//   //       order: [["createdAt", "ASC"]],
//   //     });
//   //     ordersOfOrder = ordersOfOrder.map((o) => {
//   //       return {
//   //         ...o.dataValues,
//   //       };
//   //     });
//   //     const missingOrders = [];
//   //     for (const shopifyOrder of shopifyOrders) {
//   //       const existingOrder = ordersOfOrder.find(
//   //         (o) => Number(o.subTotalPrice) === Number(shopifyOrder.subTotalPrice)
//   //       );
//   //       if (!existingOrder) {
//   //         missingOrders.push(shopifyOrder);
//   //       }
//   //     }
//   //     const result = await Order.bulkCreate(missingOrders);
//   //     const savedOrders = result.map((order) => order.toJSON());
//   //     const orderLines = [];
//   //     for (const { order_id, line_items } of lines) {
//   //       const order = savedOrders.find(
//   //         (order) => order.code === String(order_id)
//   //       );
//   //       for (const line of line_items) {
//   //         orderLines.push({
//   //           orderId: order.id,
//   //           productId: line.product_id
//   //             ? productsMap[line.product_id].id
//   //             : productsMap["custom"].id,
//   //           shopifyId: String(line.id),
//   //           title: line.title,
//   //           name: line.name,
//   //           price: line.price,
//   //           quantity: line.quantity,
//   //           sku: line.sku,
//   //           variant_id: line.variant_id,
//   //           discount: line.discount,
//   //           cost: line.cost,
//   //           unitCost: line.unitCost,
//   //         });
//   //       }
//   //     }
//   //     await OrderLine.bulkCreate(orderLines);
//   //     console.log(
//   //       `Order: ${order.name}, Shopify Count: ${order.shopifyCount}, Database Count: ${order.databaseCount}, Missing Orders: ${missingOrders.length}`
//   //     );
//   //   }
// };
// module.exports = getDuplicatedOrders;
//# sourceMappingURL=orderSeeder.js.map