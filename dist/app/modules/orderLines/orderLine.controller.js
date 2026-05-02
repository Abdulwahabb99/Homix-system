"use strict";
const { AppError } = require("../../middlewares/errors");
const OrderLineService = require("./orderLine.service");
const getParam = (value) => {
    return Array.isArray(value) ? value[0] ?? "" : value ?? "";
};
class OrderLineController {
    static async updateOrderLine(req, res, next) {
        try {
            const result = await OrderLineService.updateOrderLine(getParam(req.params.orderLineId), {
                color: req.body.color,
                cost: req.body.cost,
                itemShipping: req.body.itemShipping,
                itemStatus: req.body.itemStatus,
                material: req.body.material,
                notes: req.body.notes,
                size: req.body.size,
                status: req.body.status,
                toBeCollected: req.body.toBeCollected,
            });
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update order line";
            return next(new AppError(message, 500));
        }
    }
    static async updateNote(req, res, next) {
        try {
            const result = await OrderLineService.updateNote(req.user ?? { id: 0 }, getParam(req.params.orderLineId), getParam(req.params.noteId), String(req.body.text ?? ""));
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to update note";
            return next(new AppError(message, 500));
        }
    }
    static async addNote(req, res, next) {
        try {
            const result = await OrderLineService.addNote(req.user ?? { id: 0 }, getParam(req.params.orderLineId), String(req.body.text ?? ""));
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to add note";
            return next(new AppError(message, 500));
        }
    }
    static async deleteNote(req, res, next) {
        try {
            const result = await OrderLineService.deleteNote(req.user ?? { id: 0 }, getParam(req.params.orderLineId), getParam(req.params.noteId));
            return res.status(result.statusCode).json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to delete note";
            return next(new AppError(message, 500));
        }
    }
}
module.exports = OrderLineController;
//# sourceMappingURL=orderLine.controller.js.map