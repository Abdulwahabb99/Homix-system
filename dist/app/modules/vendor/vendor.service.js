"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../../../src/config/env");
const User = require("../user/user.model");
const UserService = require("../user/user.service");
const Vendor = require("./vendor.model");
const sanitizeVendorName = (name) => {
    return name.replace(/[^a-zA-Z0-9]/g, "");
};
class VendorsService {
    static async create(data) {
        const transaction = await Vendor.sequelize.transaction();
        try {
            let vendor = (await Vendor.create({
                name: data.name,
            }));
            const plainVendor = vendor.toJSON();
            plainVendor.name = sanitizeVendorName(plainVendor.name);
            const password = await bcryptjs_1.default.hash(data.password
                ? data.password
                : `${UserService.capitalizeFirstLetter(plainVendor.name)}#${env_1.env.DEFAULT_PASSWORD}`, 10);
            const user = await UserService.addUser({
                email: data.email || `${plainVendor.name}@${env_1.env.SHOPIFY_STORE}.com`,
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
        }
        catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
    static async getOne(id) {
        const vendor = (await Vendor.findByPk(id));
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
    static async update(id, data) {
        const existingVendor = (await Vendor.findByPk(id));
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
        });
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
    static async getExistingVendorsMap(names) {
        const result = {};
        const uniqueNames = [...new Set(names)];
        const existingVendors = (await Vendor.findAll({
            where: {
                name: uniqueNames,
            },
        }));
        for (const vendor of existingVendors) {
            result[vendor.name] = vendor;
        }
        const existingVendorNames = new Set(existingVendors.map((vendor) => vendor.name));
        const createdVendors = uniqueNames.filter((name) => !existingVendorNames.has(name));
        if (createdVendors.length > 0) {
            const createdVendorsData = (await Vendor.bulkCreate(createdVendors.map((name) => ({ daysToDeliver: 0, name }))));
            createdVendorsData.forEach((vendor) => {
                result[vendor.name] = vendor;
            });
        }
        await UserService.saveUsersForVendorsWithNoUsers(Object.values(result));
        return result;
    }
    static async getVendorByNameAndSaveIfNotExist(name) {
        let vendor = (await Vendor.findOne({
            where: {
                name,
            },
        }));
        if (!vendor) {
            vendor = (await Vendor.create({ name }));
        }
        return vendor.toJSON();
    }
    static async saveVendors(names) {
        const vendors = (await Vendor.bulkCreate(names.map((name) => ({ name }))));
        const plainVendors = vendors.map((vendor) => vendor.toJSON());
        await UserService.saveUsersForVendors(plainVendors);
        return plainVendors;
    }
    static async getAllVendors() {
        const vendors = (await Vendor.findAll({
            include: {
                as: "user",
                model: User,
            },
        }));
        return {
            data: vendors.map((vendor) => {
                const vendorData = vendor.toJSON();
                return {
                    ...vendorData,
                    active: Boolean(vendorData.user),
                };
            }),
            status: true,
            statusCode: 200,
        };
    }
    static async delete(id) {
        const vendor = (await Vendor.findByPk(id));
        if (!vendor) {
            return {
                message: "Vendor not found",
                status: false,
                statusCode: 404,
            };
        }
        await vendor.destroy();
        const user = (await UserService.getUserByVendorId(id));
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
module.exports = VendorsService;
//# sourceMappingURL=vendor.service.js.map