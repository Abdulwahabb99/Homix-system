"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const AuthController = require("./AuthController");
const UserController = require("./user.controller");
const verifyToken = require("../../middlewares/protectApi");
const isAdmin = require("../../middlewares/isAdmin");
const isNotVendor = require("../../middlewares/isNotVendor");
const UserRouter = express_1.default.Router();
/**
 * @swagger
 * /users:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     summary: Get all admin users
 *     responses:
 *       200:
 *         description: Users list
 */
UserRouter.get("/", verifyToken, isNotVendor, UserController.getAllUsers);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 */
UserRouter.get("/:id", verifyToken, isNotVendor, UserController.getUser);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     summary: Update user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
UserRouter.put("/:id", verifyToken, isAdmin, UserController.editUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     responses:
 *       200:
 *         description: Login result
 */
UserRouter.post("/login", AuthController.login);
/**
 * @swagger
 * /users:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     summary: Create user
 *     responses:
 *       200:
 *         description: User created successfully
 */
UserRouter.post("/", verifyToken, isAdmin, AuthController.addUser);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Users
 *     summary: Delete user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 */
UserRouter.delete("/:id", verifyToken, isAdmin, UserController.deleteUser);
module.exports = UserRouter;
//# sourceMappingURL=user.routes.js.map