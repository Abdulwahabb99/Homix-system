"use strict";
const ShopifyHelper = require("../helpers/shopifyHelper");
const Customer = require("./customer.model");
const formatAddress = (customer) => {
    if (customer.default_address) {
        const address = customer.default_address;
        return `${address.address1 ?? ""} ${address.address2 ?? ""}-${address.city ?? ""}-${address.province ?? ""}-${address.country ?? ""}`;
    }
    return `${customer.address1 ?? ""} ${customer.address2 ?? ""}-${customer.city ?? ""}-${customer.province ?? ""}-${customer.country ?? ""}`;
};
const toCustomerPayload = (customer) => {
    return {
        address: formatAddress(customer),
        email: customer.email ?? customer.default_address?.email ?? "",
        firstName: customer.firstName ??
            customer.first_name ??
            customer.default_address?.first_name ??
            customer.default_address?.name,
        lastName: customer.lastName ?? customer.last_name ?? customer.default_address?.last_name,
        phoneNumber: customer.phone ?? customer.default_address?.phone ?? "",
        shopifyId: customer.id ? String(customer.id) : null,
    };
};
const customerKey = (customer) => {
    return customer.shopifyId
        ? customer.shopifyId
        : `${customer.firstName ?? ""}${customer.lastName ?? ""}${customer.email ?? ""}${customer.phoneNumber ?? ""}`;
};
class CustomerService {
    static async importCustomers(parameters) {
        const fields = [];
        const customers = (await ShopifyHelper.importData("customers", fields, parameters));
        return CustomerService.saveImportedCustomers(customers);
    }
    static async saveImportedCustomers(customers) {
        const existingCustomers = (await Customer.findAll({
            attributes: ["shopifyId"],
            where: {
                shopifyId: customers.map((customer) => String(customer.id)),
            },
        }));
        const existingShopifyIds = new Set(existingCustomers
            .map((customer) => customer.shopifyId ?? null)
            .filter((shopifyId) => Boolean(shopifyId)));
        const payload = customers
            .filter((customer) => !existingShopifyIds.has(String(customer.id)))
            .map((customer) => toCustomerPayload(customer));
        const importedCustomers = await Customer.bulkCreate(payload, {
            updateOnDuplicate: [
                "shopifyId",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "address",
            ],
        });
        return {
            data: importedCustomers,
            message: "Customers imported successfully",
            status: true,
            statusCode: 200,
        };
    }
    static async getCustomersMappedByNames(customers) {
        const customerIds = customers
            .filter((customer) => customer.id)
            .map((customer) => String(customer.id));
        const customersFromDb = (await Customer.findAll({
            attributes: ["shopifyId", "id", "firstName", "lastName", "email", "phoneNumber"],
            where: {
                shopifyId: customerIds,
            },
        }));
        const result = {};
        const existingShopifyIds = new Set();
        for (const customer of customersFromDb) {
            result[customerKey(customer)] = customer.id;
            if (customer.shopifyId) {
                existingShopifyIds.add(customer.shopifyId);
            }
        }
        const nonExistingCustomers = customers.filter((customer) => !customer.id || !existingShopifyIds.has(String(customer.id)));
        if (nonExistingCustomers.length === 0) {
            return result;
        }
        const savedCustomers = await CustomerService.saveCustomers(nonExistingCustomers);
        for (const customer of savedCustomers) {
            result[customerKey(customer)] = customer.id;
        }
        return result;
    }
    static async saveCustomers(customers) {
        const payload = customers.map((customer) => toCustomerPayload(customer));
        const createdCustomers = (await Customer.bulkCreate(payload, {
            updateOnDuplicate: [
                "shopifyId",
                "firstName",
                "lastName",
                "email",
                "phoneNumber",
                "address",
            ],
        }));
        return createdCustomers.map((customer) => customer.toJSON());
    }
}
module.exports = CustomerService;
//# sourceMappingURL=customer.service.js.map