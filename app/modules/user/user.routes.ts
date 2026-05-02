import express from "express";

const AuthController = require("./AuthController") as typeof import("./AuthController");
const UserController = require("./user.controller") as typeof import("./user.controller");
const verifyToken = require("../../middlewares/protectApi") as typeof import("../../middlewares/protectApi");
const isAdmin = require("../../middlewares/isAdmin") as typeof import("../../middlewares/isAdmin");
const isNotVendor = require("../../middlewares/isNotVendor") as typeof import("../../middlewares/isNotVendor");

const UserRouter = express.Router();

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

export = UserRouter;
