"use strict";
const UserService = require("../user/user.service");
const VendorsService = require("./vendor.service");
const getId = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};
class VendorsController {
    static async getVendors(_req, res) {
        try {
            const vendors = await VendorsService.getAllVendors();
            return res.status(200).json(vendors);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch vendors";
            return res.status(500).json({ message });
        }
    }
    static async changeActiveStatus(req, res) {
        try {
            const response = await UserService.changeActiveStatus(getId(req));
            return res.status(response.statusCode).json(response);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to change vendor status";
            return res.status(500).json({ message });
        }
    }
    static async createVendor(req, res) {
        try {
            const response = await VendorsService.create(req.body);
            return res.status(response.statusCode).json(response);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to create vendor";
            return res.status(500).json({ message });
        }
    }
    static async getOneVendor(req, res) {
        try {
            const response = await VendorsService.getOne(getId(req));
            return res.status(response.statusCode).json(response);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch vendor";
            return res.status(500).json({ message });
        }
    }
    static async updateVendor(req, res) {
        try {
            const response = await VendorsService.update(getId(req), req.body);
            return res.status(response.statusCode).json(response);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update vendor";
            return res.status(500).json({ message });
        }
    }
    static async deleteVendor(req, res) {
        try {
            const response = await VendorsService.delete(getId(req));
            return res.status(response.statusCode).json(response);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete vendor";
            return res.status(500).json({ message });
        }
    }
}
module.exports = VendorsController;
//# sourceMappingURL=vendor.controller.js.map