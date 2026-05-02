const ShopifyHelper = require("../helpers/shopifyHelper") as typeof import("../helpers/shopifyHelper");
const Customer = require("./customer.model") as typeof import("./customer.model");

type CustomerAddress = {
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone?: string;
  province?: string;
};

type CustomerInput = {
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  default_address?: CustomerAddress;
  email?: string;
  firstName?: string;
  first_name?: string;
  id?: number | string;
  lastName?: string;
  last_name?: string;
  phone?: string;
  province?: string;
};

type PersistedCustomer = {
  email?: string | null;
  firstName?: string | null;
  id: number;
  lastName?: string | null;
  phoneNumber?: string | null;
  shopifyId?: string | null;
  toJSON: () => PersistedCustomer;
};

type CustomerPayload = {
  address: string;
  email: string;
  firstName: string | undefined;
  lastName: string | undefined;
  phoneNumber: string;
  shopifyId: string | null;
};

const formatAddress = (customer: CustomerInput): string => {
  if (customer.default_address) {
    const address = customer.default_address;
    return `${address.address1 ?? ""} ${address.address2 ?? ""}-${address.city ?? ""}-${address.province ?? ""}-${address.country ?? ""}`;
  }

  return `${customer.address1 ?? ""} ${customer.address2 ?? ""}-${customer.city ?? ""}-${customer.province ?? ""}-${customer.country ?? ""}`;
};

const toCustomerPayload = (customer: CustomerInput): CustomerPayload => {
  return {
    address: formatAddress(customer),
    email: customer.email ?? customer.default_address?.email ?? "",
    firstName:
      customer.firstName ??
      customer.first_name ??
      customer.default_address?.first_name ??
      customer.default_address?.name,
    lastName: customer.lastName ?? customer.last_name ?? customer.default_address?.last_name,
    phoneNumber: customer.phone ?? customer.default_address?.phone ?? "",
    shopifyId: customer.id ? String(customer.id) : null,
  };
};

const customerKey = (customer: {
  email?: string | null;
  firstName?: string | null;
  id?: number;
  lastName?: string | null;
  phoneNumber?: string | null;
  shopifyId?: string | null;
}): string => {
  return customer.shopifyId
    ? customer.shopifyId
    : `${customer.firstName ?? ""}${customer.lastName ?? ""}${customer.email ?? ""}${customer.phoneNumber ?? ""}`;
};

class CustomerService {
  public static async importCustomers(parameters: Record<string, unknown>) {
    const fields: string[] = [];
    const customers = (await ShopifyHelper.importData("customers", fields, parameters)) as CustomerInput[];
    return CustomerService.saveImportedCustomers(customers);
  }

  public static async saveImportedCustomers(customers: CustomerInput[]) {
    const existingCustomers = (await Customer.findAll({
      attributes: ["shopifyId"],
      where: {
        shopifyId: customers.map((customer) => String(customer.id)),
      },
    })) as Array<{ shopifyId?: string | null }>;

    const existingShopifyIds = new Set(
      existingCustomers
        .map((customer) => customer.shopifyId ?? null)
        .filter((shopifyId): shopifyId is string => Boolean(shopifyId)),
    );

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

  public static async getCustomersMappedByNames(customers: CustomerInput[]): Promise<Record<string, number>> {
    const customerIds = customers
      .filter((customer) => customer.id)
      .map((customer) => String(customer.id));

    const customersFromDb = (await Customer.findAll({
      attributes: ["shopifyId", "id", "firstName", "lastName", "email", "phoneNumber"],
      where: {
        shopifyId: customerIds,
      },
    })) as PersistedCustomer[];

    const result: Record<string, number> = {};
    const existingShopifyIds = new Set<string>();

    for (const customer of customersFromDb) {
      result[customerKey(customer)] = customer.id;
      if (customer.shopifyId) {
        existingShopifyIds.add(customer.shopifyId);
      }
    }

    const nonExistingCustomers = customers.filter(
      (customer) => !customer.id || !existingShopifyIds.has(String(customer.id)),
    );

    if (nonExistingCustomers.length === 0) {
      return result;
    }

    const savedCustomers = await CustomerService.saveCustomers(nonExistingCustomers);
    for (const customer of savedCustomers) {
      result[customerKey(customer)] = customer.id;
    }

    return result;
  }

  public static async saveCustomers(customers: CustomerInput[]): Promise<PersistedCustomer[]> {
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
    })) as PersistedCustomer[];

    return createdCustomers.map((customer) => customer.toJSON());
  }
}

export = CustomerService;
