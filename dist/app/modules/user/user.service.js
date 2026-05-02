"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const env_1 = require("../../../src/config/env");
const constants_1 = require("../../../config/constants");
const User = require("./user.model");
const Vendor = require("../vendor/vendor.model");
const toRecord = (value) => {
    return typeof value.toJSON === "function"
        ? value.toJSON()
        : value;
};
const normalizeEmail = (email) => {
    return String(email).toLowerCase();
};
class UserService {
    static async login(email, password) {
        if (!email || !password) {
            return {
                message: "Email and password are required",
                status: false,
                statusCode: 400,
            };
        }
        const user = (await User.scope("withPassword").findOne({
            where: { email: normalizeEmail(email) },
        }));
        if (!user?.password) {
            return {
                message: "Invalid email or password",
                status: false,
                statusCode: 401,
            };
        }
        const isMatch = await bcryptjs_1.default.compare(String(password), String(user.password));
        if (!isMatch) {
            return {
                message: "Invalid email or password",
                status: false,
                statusCode: 401,
            };
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, env_1.env.JWT_SECRET, {
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
    static async addUser(body) {
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
        if (!body.userType || !Object.values(constants_1.USER_TYPES).includes(body.userType)) {
            return {
                message: "Invalid user type",
                status: false,
                statusCode: 400,
            };
        }
        const hashedPassword = await bcryptjs_1.default.hash(String(password), 10);
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
    static async getUser(id) {
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
    static async editUser(id, body) {
        const user = (await User.findByPk(id));
        if (!user) {
            return {
                message: "User not found",
                status: false,
                statusCode: 404,
            };
        }
        const payload = { ...body };
        if (typeof payload.password === "string" && payload.password) {
            payload.password = await bcryptjs_1.default.hash(payload.password, 10);
        }
        const updatedUser = await user.update(payload);
        return {
            data: updatedUser,
            status: true,
            statusCode: 200,
        };
    }
    static async getAdminUsers() {
        const users = await User.findAll({
            where: {
                userType: { [sequelize_1.Op.not]: constants_1.USER_TYPES.VENDOR },
            },
        });
        return {
            data: users,
            status: true,
            statusCode: 200,
        };
    }
    static async getAllUsers() {
        const users = await User.findAll();
        return {
            data: users,
            status: true,
            statusCode: 200,
        };
    }
    static capitalizeFirstLetter(value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
    static async saveUsersForVendorsWithNoUsers(createdVendors) {
        const users = (await User.findAll({
            paranoid: false,
            where: { vendorId: createdVendors.map((vendor) => vendor.id) },
        }));
        const vendors = createdVendors.filter((vendor) => !users.find((user) => user.vendorId === vendor.id));
        await UserService.saveUsersForVendors(vendors);
    }
    static async saveUsersForVendors(vendors) {
        const namesSet = new Set();
        let counter = 0;
        const promises = vendors.map(async (vendor) => {
            let vendorName = vendor.name.toLowerCase();
            if (namesSet.has(vendorName)) {
                vendorName = `${vendorName}${counter}`;
                counter += 1;
            }
            vendor.name = vendor.name.replace(/[^a-zA-Z0-9]/g, "");
            const password = await bcryptjs_1.default.hash(`${UserService.capitalizeFirstLetter(vendor.name.toLowerCase())}#${env_1.env.DEFAULT_PASSWORD}`, 10);
            namesSet.add(vendorName);
            return User.create({
                email: `${vendorName}1@${env_1.env.SHOPIFY_STORE}.com`,
                firstName: vendor.name,
                password,
                userType: constants_1.USER_TYPES.VENDOR,
                vendorId: vendor.id,
            });
        });
        return Promise.all(promises);
    }
    static async getUserByVendorId(vendorId, withDeleted = false) {
        return (await User.findOne({
            paranoid: !withDeleted,
            where: { vendorId },
        }));
    }
    static async updateVendorUser(vendorId, input) {
        const payload = {};
        if (input.name) {
            payload.firstName = input.name;
        }
        if (input.password) {
            payload.password = await bcryptjs_1.default.hash(input.password, 10);
        }
        if (input.email) {
            payload.email = input.email;
        }
        let user = (await User.findOne({
            paranoid: false,
            where: { vendorId: Number(vendorId) },
        }));
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
    static async changeActiveStatus(vendorId) {
        const transaction = await Vendor.sequelize.transaction();
        try {
            const vendor = (await Vendor.findOne({
                where: { id: vendorId },
            }));
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
            }));
            if (user) {
                if (user.deletedAt) {
                    await user.restore();
                }
                else {
                    await user.destroy();
                }
            }
            else {
                const existingUser = (await User.findOne({
                    paranoid: false,
                    where: {
                        email: `${vendor.name.toLowerCase()}@${env_1.env.SHOPIFY_STORE}.com`,
                    },
                }));
                if (existingUser) {
                    await User.update({ deletedAt: null, vendorId: vendor.id }, {
                        where: {
                            id: existingUser.id,
                        },
                    });
                }
                else {
                    await User.create({
                        email: `${vendor.name.toLowerCase()}@${env_1.env.SHOPIFY_STORE}.com`,
                        firstName: vendor.name,
                        password: await bcryptjs_1.default.hash(`${UserService.capitalizeFirstLetter(vendor.name.toLowerCase())}#${env_1.env.DEFAULT_PASSWORD}`, 10),
                        userType: constants_1.USER_TYPES.VENDOR,
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
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    static async deleteUser(id) {
        const user = (await User.findByPk(id));
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
module.exports = UserService;
//# sourceMappingURL=user.service.js.map