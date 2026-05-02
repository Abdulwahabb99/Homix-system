"use strict";
const { AppError } = require("../../middlewares/errors");
const FactoryService = require("./factory.service");
const getParam = (value) => {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};
class FactoryController {
    static async deleteAttachment(req, res, next) {
        try {
            const factory = await FactoryService.deleteAttachment(getParam(req.params.factoryId), getParam(req.params.attachmentId));
            return res.status(200).json(factory);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete attachment";
            return next(new AppError(message, 500));
        }
    }
    static async uploadFiles(req, res, next) {
        try {
            const factory = await FactoryService.uploadFiles(getParam(req.params.id), req.filePaths, req.fileNames, req.descriptions);
            return res.status(200).json(factory);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to upload files";
            return next(new AppError(message, 500));
        }
    }
    static async create(req, res, next) {
        try {
            const factory = await FactoryService.create(req.body);
            return res.status(201).json(factory);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create factory";
            return next(new AppError(message, 500));
        }
    }
    static async getOne(req, res, next) {
        try {
            const factory = await FactoryService.getOne(getParam(req.params.id));
            return res.status(200).json(factory);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch factory";
            return next(new AppError(message, 500));
        }
    }
    static async getAll(req, res, next) {
        try {
            const factories = await FactoryService.getAll(req.query);
            return res.status(200).json({
                data: factories,
                status: true,
                statusCode: 200,
            });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch factories";
            return next(new AppError(message, 500));
        }
    }
    static async update(req, res, next) {
        try {
            const factory = await FactoryService.update(getParam(req.params.id), req.body);
            return res.status(200).json(factory);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update factory";
            return next(new AppError(message, 500));
        }
    }
    static async delete(req, res, next) {
        try {
            const factory = await FactoryService.delete(getParam(req.params.id));
            return res.status(200).json(factory);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete factory";
            return next(new AppError(message, 500));
        }
    }
}
module.exports = FactoryController;
//# sourceMappingURL=factory.controller.js.map