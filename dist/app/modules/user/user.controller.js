"use strict";
const UserService = require("./user.service");
const getId = (req) => {
    const id = req.params.id;
    return Array.isArray(id) ? id[0] ?? "" : id ?? "";
};
class UserController {
    static async getAllUsers(_req, res) {
        try {
            const users = await UserService.getAdminUsers();
            return res.status(200).json(users);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch users";
            return res.status(500).json({ message });
        }
    }
    static async getUser(req, res) {
        try {
            const user = await UserService.getUser(getId(req));
            return res.status(200).json(user);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to fetch user";
            return res.status(500).json({ message });
        }
    }
    static async editUser(req, res) {
        try {
            const user = await UserService.editUser(getId(req), req.body);
            return res.status(200).json(user);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to edit user";
            return res.status(500).json({ message });
        }
    }
    static async deleteUser(req, res) {
        try {
            const user = await UserService.deleteUser(getId(req));
            return res.status(200).json(user);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete user";
            return res.status(500).json({ message });
        }
    }
}
module.exports = UserController;
//# sourceMappingURL=user.controller.js.map