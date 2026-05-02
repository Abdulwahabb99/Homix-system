"use strict";
const sequelize_1 = require("sequelize");
const { sequelize } = require("../../../src/infrastructure/database");
const Attachment = require("../attachments/attachment.model");
const Factory = require("./factory.model");
class FactoryService {
    static async deleteAttachment(factoryId, attachmentId) {
        const factory = await Factory.findByPk(factoryId);
        if (!factory) {
            return {
                message: "Factory not found",
                status: false,
                statusCode: 404,
            };
        }
        const attachment = (await Attachment.findByPk(attachmentId));
        if (!attachment) {
            return {
                message: "Attachment not found",
                status: false,
                statusCode: 404,
            };
        }
        await attachment.destroy();
        return {
            message: "Attachment deleted successfully",
            status: true,
            statusCode: 200,
        };
    }
    static async uploadFiles(factoryId, filePaths = [], fileNames = [], descriptions = []) {
        const factory = await Factory.findByPk(factoryId);
        if (!factory) {
            return {
                message: "Factory not found",
                status: false,
                statusCode: 404,
            };
        }
        for (let index = 0; index < filePaths.length; index += 1) {
            await Attachment.create({
                description: descriptions[index] ?? "",
                modelId: factoryId,
                modelType: "Factory",
                name: fileNames[index],
                url: filePaths[index],
            });
        }
        return {
            message: "Files uploaded!",
            status: true,
            statusCode: 200,
        };
    }
    static async create(data) {
        return Factory.create(data);
    }
    static async getAll({ status, factoryCategory }) {
        const andConditions = [];
        if (status) {
            andConditions.push(sequelize.where(sequelize.col("status"), {
                [sequelize_1.Op.eq]: status,
            }));
        }
        if (factoryCategory) {
            andConditions.push(sequelize.where(sequelize.col("factoryCategory"), {
                [sequelize_1.Op.like]: `%${factoryCategory}%`,
            }));
        }
        return Factory.findAll({
            include: [
                {
                    as: "attachments",
                    model: Attachment,
                },
            ],
            where: {
                [sequelize_1.Op.and]: andConditions,
            },
        });
    }
    static async getOne(id) {
        return Factory.findByPk(id, {
            include: [
                {
                    as: "attachments",
                    model: Attachment,
                },
            ],
        });
    }
    static async update(id, data) {
        const factory = (await Factory.findByPk(id));
        if (!factory) {
            return {
                message: "Factory not found",
                status: false,
                statusCode: 404,
            };
        }
        await factory.update(data);
        return {
            data: "Factory updated successfully",
            status: true,
            statusCode: 200,
        };
    }
    static async delete(id) {
        const factory = (await Factory.findByPk(id));
        if (!factory) {
            return {
                message: "Factory not found",
                status: false,
                statusCode: 404,
            };
        }
        await factory.destroy();
        return {
            message: "Factory deleted successfully",
            status: true,
            statusCode: 200,
        };
    }
}
module.exports = FactoryService;
//# sourceMappingURL=factory.service.js.map