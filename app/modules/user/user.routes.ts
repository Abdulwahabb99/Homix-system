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
 *     description: Returns the administrative user list. Vendor users are blocked from this endpoint.
 *     responses:
 *       200:
 *         description: Users list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *             examples:
 *               default:
 *                 value:
 *                   status: true
 *                   statusCode: 200
 *                   data:
 *                     - id: 1
 *                       firstName: Ahmed
 *                       lastName: Hesham
 *                       email: admin@homix.com
 *                       userType: admin
 *                       isActive: true
 *       401:
 *         description: Missing or invalid bearer token
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: User not found
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpsertRequest'
 *           examples:
 *             updateAdmin:
 *               value:
 *                 firstName: Ibrahim
 *                 email: ibrahim@homix.com
 *                 userType: admin
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: User not found
 */
UserRouter.put("/:id", verifyToken, isAdmin, UserController.editUser);
/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             adminLogin:
 *               value:
 *                 email: admin@homix.com
 *                 password: Secret123!
 *     responses:
 *       200:
 *         description: Login result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpsertRequest'
 *           examples:
 *             createAdmin:
 *               value:
 *                 firstName: Nour
 *                 email: nour@homix.com
 *                 password: Secret123!
 *                 userType: admin
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       409:
 *         description: User already exists
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GenericMessageResponse'
 *       401:
 *         description: Missing or invalid bearer token
 *       404:
 *         description: User not found
 */
UserRouter.delete("/:id", verifyToken, isAdmin, UserController.deleteUser);

export = UserRouter;
