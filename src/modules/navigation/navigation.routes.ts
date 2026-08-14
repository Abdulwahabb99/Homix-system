import express from "express";

import { asyncHandler } from "../../shared/http";
import { NavigationCountsController } from "./navigation.controller";
import { NavigationCountsRepository } from "./navigation.repo";
import { NavigationCountsService } from "./navigation.service";
import { navigationCountsEvents } from "./navigation.events";

const verifyToken = require("../../../app/middlewares/protectApi");

const repository = new NavigationCountsRepository();
const service = new NavigationCountsService(repository);
const controller = new NavigationCountsController(service);

navigationCountsEvents.on("changed", () => service.invalidate());

export const navigationRouter = express.Router();

navigationRouter.get("/counts", verifyToken, asyncHandler(controller.getCounts));
