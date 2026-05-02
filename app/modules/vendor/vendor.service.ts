import bcrypt from "bcryptjs";

import { env } from "../../../src/config/env";

const User = require("../user/user.model") as typeof import("../user/user.model");
const UserService = require("../user/user.service") as typeof import("../user/user.service");
const Vendor = require("./vendor.model") as typeof import("./vendor.model");

type VendorRecord = {
  active?: boolean;
  destroyed?: boolean;
  destroy: () => Promise<void>;
  email?: string;
  id: number;
  name: string;
  toJSON: () => VendorRecord;
  update: (payload: Record<string, unknown>) => Promise<VendorRecord>;
};

type UserRecord = {
  deletedAt?: Date | null;
  destroy: () => Promise<void>;
  email?: string;
  id: number;
  restore?: () => Promise<void>;
  vendorId?: number | null;
};

type VendorCreateInput = {
  active?: boolean;
  daysToDeliver?: number;
  email?: string;
  name: string;
  password?: string;
};

type VendorUserUpdateInput = {
  active: boolean | undefined;
  email: string | undefined;
  name: string | undefined;
  password: string | undefined;
};

type VendorResponse = {
  data?: unknown;
  message?: string;
  status: boolean;
  statusCode: number;
};

const sanitizeVendorName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9]/g, "");
};

class VendorsService {
  public static async create(data: VendorCreateInput): Promise<VendorResponse> {
    const transaction = await Vendor.sequelize.transaction();

    try {
      let vendor = (await Vendor.create({
        name: data.name,
      })) as VendorRecord;

      const plainVendor = vendor.toJSON();
      plainVendor.name = sanitizeVendorName(plainVendor.name);

      const password = await bcrypt.hash(
        data.password
          ? data.password
          : `${UserService.capitalizeFirstLetter(plainVendor.name)}#${env.DEFAULT_PASSWORD}`,
        10,
      );

      const user = await UserService.addUser({
        email: data.email || `${plainVendor.name}@${env.SHOPIFY_STORE}.com`,
        firstName: plainVendor.name,
        password,
        userType: "2",
        vendorId: plainVendor.id,
      });

      if (!user?.status) {
        await transaction.rollback();
        return user;
      }

      await transaction.commit();
      return {
        data: {
          ...plainVendor,
          active: true,
        },
        message: "Vendor created successfully",
        status: true,
        statusCode: 200,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public static async getOne(id: string): Promise<VendorResponse> {
    const vendor = (await Vendor.findByPk(id)) as VendorRecord | null;
    if (!vendor) {
      return {
        message: "Vendor not found",
        status: false,
        statusCode: 404,
      };
    }

    const vendorData = vendor.toJSON();
    const user = await UserService.getUserByVendorId(id);

    return {
      data: {
        ...vendorData,
        active: Boolean(user),
        email: user?.email,
        user,
      },
      status: true,
      statusCode: 200,
    };
  }

  public static async update(id: string, data: VendorCreateInput): Promise<VendorResponse> {
    const existingVendor = (await Vendor.findByPk(id)) as VendorRecord | null;
    if (!existingVendor) {
      return {
        message: "Vendor not found",
        status: false,
        statusCode: 404,
      };
    }

    const user = await UserService.updateVendorUser(id, {
      active: data.active,
      email: data.email,
      name: data.name,
      password: data.password,
    } as VendorUserUpdateInput);
    const vendor = await existingVendor.update({
      daysToDeliver: data.daysToDeliver,
      name: data.name,
    });

    return {
      data: {
        ...vendor.toJSON(),
        active: Boolean(user),
        user,
      },
      message: "Vendor updated successfully",
      status: true,
      statusCode: 200,
    };
  }

  public static async getExistingVendorsMap(names: string[]): Promise<Record<string, VendorRecord>> {
    const result: Record<string, VendorRecord> = {};
    const uniqueNames = [...new Set(names)];
    const existingVendors = (await Vendor.findAll({
      where: {
        name: uniqueNames,
      },
    })) as VendorRecord[];

    for (const vendor of existingVendors) {
      result[vendor.name] = vendor;
    }

    const existingVendorNames = new Set(existingVendors.map((vendor) => vendor.name));
    const createdVendors = uniqueNames.filter((name) => !existingVendorNames.has(name));

    if (createdVendors.length > 0) {
      const createdVendorsData = (await Vendor.bulkCreate(
        createdVendors.map((name) => ({ daysToDeliver: 0, name })),
      )) as VendorRecord[];

      createdVendorsData.forEach((vendor) => {
        result[vendor.name] = vendor;
      });
    }

    await UserService.saveUsersForVendorsWithNoUsers(Object.values(result));
    return result;
  }

  public static async getVendorByNameAndSaveIfNotExist(name: string): Promise<VendorRecord> {
    let vendor = (await Vendor.findOne({
      where: {
        name,
      },
    })) as VendorRecord | null;

    if (!vendor) {
      vendor = (await Vendor.create({ name })) as VendorRecord;
    }

    return vendor.toJSON();
  }

  public static async saveVendors(names: string[]): Promise<VendorRecord[]> {
    const vendors = (await Vendor.bulkCreate(names.map((name) => ({ name })))) as VendorRecord[];
    const plainVendors = vendors.map((vendor) => vendor.toJSON());
    await UserService.saveUsersForVendors(plainVendors);
    return plainVendors;
  }

  public static async getAllVendors(): Promise<VendorResponse> {
    const vendors = (await Vendor.findAll({
      include: {
        as: "user",
        model: User,
      },
    })) as Array<VendorRecord & { user?: UserRecord | null }>;

    return {
      data: vendors.map((vendor) => {
        const vendorData = vendor.toJSON() as VendorRecord & { user?: UserRecord | null };
        return {
          ...vendorData,
          active: Boolean(vendorData.user),
        };
      }),
      status: true,
      statusCode: 200,
    };
  }

  public static async delete(id: string): Promise<VendorResponse> {
    const vendor = (await Vendor.findByPk(id)) as VendorRecord | null;
    if (!vendor) {
      return {
        message: "Vendor not found",
        status: false,
        statusCode: 404,
      };
    }

    await vendor.destroy();
    const user = (await UserService.getUserByVendorId(id)) as UserRecord | null;
    if (user) {
      await user.destroy();
    }

    return {
      message: "Vendor deleted successfully",
      status: true,
      statusCode: 200,
    };
  }
}

export = VendorsService;
