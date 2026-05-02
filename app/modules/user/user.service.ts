import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";

import { env } from "../../../src/config/env";
import { USER_TYPES } from "../../../config/constants";

const User = require("./user.model") as typeof import("./user.model");
const Vendor = require("../vendor/vendor.model") as typeof import("../vendor/vendor.model");

type UserTypeValue = (typeof USER_TYPES)[keyof typeof USER_TYPES];

type UserRecord = {
  deletedAt?: Date | null;
  destroy: () => Promise<void>;
  email: string;
  id: number;
  password?: string;
  restore: () => Promise<void>;
  toJSON: () => UserRecord;
  update: (payload: Record<string, unknown>) => Promise<UserRecord>;
  userType?: string;
  vendorId?: number | null;
};

type VendorRecord = {
  id: number;
  name: string;
};

type UserResponse = {
  data?: unknown;
  message?: string;
  status: boolean;
  statusCode: number;
};

type AddUserInput = {
  email?: string;
  firstName?: string;
  password?: string;
  userType?: string;
  vendorId?: number;
};

type VendorUserUpdateInput = {
  active?: boolean;
  email?: string;
  name?: string;
  password?: string;
};

const toRecord = <TRecord>(value: TRecord | { toJSON: () => TRecord }): TRecord => {
  return typeof (value as { toJSON?: () => TRecord }).toJSON === "function"
    ? (value as { toJSON: () => TRecord }).toJSON()
    : (value as TRecord);
};

const normalizeEmail = (email: string): string => {
  return String(email).toLowerCase();
};

class UserService {
  public static async login(email?: string, password?: string): Promise<UserResponse> {
    if (!email || !password) {
      return {
        message: "Email and password are required",
        status: false,
        statusCode: 400,
      };
    }

    const user = (await User.scope("withPassword").findOne({
      where: { email: normalizeEmail(email) },
    })) as UserRecord | null;

    if (!user?.password) {
      return {
        message: "Invalid email or password",
        status: false,
        statusCode: 401,
      };
    }

    const isMatch = await bcrypt.compare(String(password), String(user.password));
    if (!isMatch) {
      return {
        message: "Invalid email or password",
        status: false,
        statusCode: 401,
      };
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: "3d",
    });

    return {
      data: {
        token,
        user,
      },
      status: true,
      statusCode: 200,
    };
  }

  public static async addUser(body: AddUserInput): Promise<UserResponse> {
    const { email, password } = body;

    if (!email || !password) {
      return {
        message: "Email and password are required",
        status: false,
        statusCode: 400,
      };
    }

    const existingUser = await User.findOne({
      where: { email: normalizeEmail(email) },
    });
    if (existingUser) {
      return {
        message: "User already exists",
        status: false,
        statusCode: 409,
      };
    }

    if (!body.userType || !Object.values(USER_TYPES).includes(body.userType as UserTypeValue)) {
      return {
        message: "Invalid user type",
        status: false,
        statusCode: 400,
      };
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const newUser = await User.create({
      ...body,
      email: normalizeEmail(email),
      password: hashedPassword,
    });

    return {
      data: newUser,
      status: true,
      statusCode: 200,
    };
  }

  public static async getUser(id: string): Promise<UserResponse> {
    const user = await User.findByPk(id);
    if (!user) {
      return {
        message: "User not found",
        status: false,
        statusCode: 404,
      };
    }

    return {
      data: user,
      status: true,
      statusCode: 200,
    };
  }

  public static async editUser(id: string, body: Record<string, unknown>): Promise<UserResponse> {
    const user = (await User.findByPk(id)) as UserRecord | null;
    if (!user) {
      return {
        message: "User not found",
        status: false,
        statusCode: 404,
      };
    }

    const payload = { ...body };
    if (typeof payload.password === "string" && payload.password) {
      payload.password = await bcrypt.hash(payload.password, 10);
    }

    const updatedUser = await user.update(payload);
    return {
      data: updatedUser,
      status: true,
      statusCode: 200,
    };
  }

  public static async getAdminUsers(): Promise<UserResponse> {
    const users = await User.findAll({
      where: {
        userType: { [Op.not]: USER_TYPES.VENDOR },
      },
    });

    return {
      data: users,
      status: true,
      statusCode: 200,
    };
  }

  public static async getAllUsers(): Promise<UserResponse> {
    const users = await User.findAll();
    return {
      data: users,
      status: true,
      statusCode: 200,
    };
  }

  public static capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  public static async saveUsersForVendorsWithNoUsers(createdVendors: VendorRecord[]): Promise<void> {
    const users = (await User.findAll({
      paranoid: false,
      where: { vendorId: createdVendors.map((vendor) => vendor.id) },
    })) as UserRecord[];

    const vendors = createdVendors.filter(
      (vendor) => !users.find((user) => user.vendorId === vendor.id),
    );

    await UserService.saveUsersForVendors(vendors);
  }

  public static async saveUsersForVendors(vendors: VendorRecord[]): Promise<UserRecord[]> {
    const namesSet = new Set<string>();
    let counter = 0;

    const promises = vendors.map(async (vendor) => {
      let vendorName = vendor.name.toLowerCase();
      if (namesSet.has(vendorName)) {
        vendorName = `${vendorName}${counter}`;
        counter += 1;
      }

      vendor.name = vendor.name.replace(/[^a-zA-Z0-9]/g, "");
      const password = await bcrypt.hash(
        `${UserService.capitalizeFirstLetter(vendor.name.toLowerCase())}#${env.DEFAULT_PASSWORD}`,
        10,
      );

      namesSet.add(vendorName);
      return User.create({
        email: `${vendorName}1@${env.SHOPIFY_STORE}.com`,
        firstName: vendor.name,
        password,
        userType: USER_TYPES.VENDOR,
        vendorId: vendor.id,
      });
    });

    return Promise.all(promises) as Promise<UserRecord[]>;
  }

  public static async getUserByVendorId(vendorId: string | number, withDeleted = false): Promise<UserRecord | null> {
    return (await User.findOne({
      paranoid: !withDeleted,
      where: { vendorId },
    })) as UserRecord | null;
  }

  public static async updateVendorUser(vendorId: string, input: VendorUserUpdateInput): Promise<UserRecord | null> {
    const payload: Record<string, unknown> = {};
    if (input.name) {
      payload.firstName = input.name;
    }
    if (input.password) {
      payload.password = await bcrypt.hash(input.password, 10);
    }
    if (input.email) {
      payload.email = input.email;
    }

    let user = (await User.findOne({
      paranoid: false,
      where: { vendorId: Number(vendorId) },
    })) as UserRecord | null;

    if (user && Object.keys(payload).length > 0) {
      user = await user.update(payload);
    }

    if (user?.deletedAt && input.active) {
      await User.restore({
        where: { vendorId: Number(vendorId) },
      });
    }

    return user ? toRecord(user) : null;
  }

  public static async changeActiveStatus(vendorId: string): Promise<UserResponse> {
    const transaction = await Vendor.sequelize.transaction();

    try {
      const vendor = (await Vendor.findOne({
        where: { id: vendorId },
      })) as VendorRecord | null;

      if (!vendor) {
        return {
          message: "Vendor not found",
          status: false,
          statusCode: 404,
        };
      }

      const user = (await User.findOne({
        paranoid: false,
        where: { vendorId },
      })) as UserRecord | null;

      if (user) {
        if (user.deletedAt) {
          await user.restore();
        } else {
          await user.destroy();
        }
      } else {
        const existingUser = (await User.findOne({
          paranoid: false,
          where: {
            email: `${vendor.name.toLowerCase()}@${env.SHOPIFY_STORE}.com`,
          },
        })) as UserRecord | null;

        if (existingUser) {
          await User.update(
            { deletedAt: null, vendorId: vendor.id },
            {
              where: {
                id: existingUser.id,
              },
            },
          );
        } else {
          await User.create({
            email: `${vendor.name.toLowerCase()}@${env.SHOPIFY_STORE}.com`,
            firstName: vendor.name,
            password: await bcrypt.hash(
              `${UserService.capitalizeFirstLetter(vendor.name.toLowerCase())}#${env.DEFAULT_PASSWORD}`,
              10,
            ),
            userType: USER_TYPES.VENDOR,
            vendorId: vendor.id,
          });
        }
      }

      await transaction.commit();
      return {
        message: "Vendor active status changed successfully",
        status: true,
        statusCode: 200,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  public static async deleteUser(id: string): Promise<UserResponse> {
    const user = (await User.findByPk(id)) as UserRecord | null;
    if (!user) {
      return {
        message: "User not found",
        status: false,
        statusCode: 404,
      };
    }

    await user.destroy();
    return {
      message: "User deleted successfully",
      status: true,
      statusCode: 200,
    };
  }
}

export = UserService;
