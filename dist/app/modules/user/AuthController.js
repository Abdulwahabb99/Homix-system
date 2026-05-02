"use strict";
const { AppError } = require("../../middlewares/errors");
const UserService = require("./user.service");
class AuthController {
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await UserService.login(email, password);
            return res.status(user.statusCode).json(user);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Login failed";
            return next(new AppError(message, 500));
        }
    }
    static async addUser(req, res, next) {
        try {
            const user = await UserService.addUser(req.body);
            if (user.status === false) {
                return res.status(user.statusCode).json(user);
            }
            return res.status(user.statusCode).send(user);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Add user failed";
            return next(new AppError(message, 500));
        }
    }
}
module.exports = AuthController;
//# sourceMappingURL=AuthController.js.map