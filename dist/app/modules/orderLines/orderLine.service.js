"use strict";
const constants_1 = require("../../../config/constants");
const Note = require("../notes/notes.model");
const Order = require("../order/order.model");
const OrderLine = require("./orderline.model");
const removeUndefinedFields = (payload) => {
    const nextPayload = { ...payload };
    Object.keys(nextPayload).forEach((key) => {
        const typedKey = key;
        if (nextPayload[typedKey] === undefined || nextPayload[typedKey] === null) {
            delete nextPayload[typedKey];
        }
    });
    return nextPayload;
};
class OrderLineService {
    static async updateOrderLine(orderLineId, orderData) {
        if (Object.keys(orderData).length === 0) {
            return {
                message: "Please provide the data to update",
                status: false,
                statusCode: 400,
            };
        }
        const orderLine = (await OrderLine.findByPk(orderLineId));
        if (!orderLine) {
            return {
                message: "Order Line not found",
                status: false,
                statusCode: 404,
            };
        }
        const nextOrderData = removeUndefinedFields(orderData);
        if (nextOrderData.cost || nextOrderData.itemShipping || nextOrderData.toBeCollected) {
            const order = (await Order.findByPk(orderLine.orderId));
            if (!order) {
                return {
                    message: "The order for this order line not found",
                    status: false,
                    statusCode: 404,
                };
            }
            if (nextOrderData.cost) {
                nextOrderData.unitCost = Number(nextOrderData.cost);
                nextOrderData.cost = Number(nextOrderData.cost) * orderLine.quantity;
                order.totalCost = order.totalCost - orderLine.cost + nextOrderData.cost;
            }
            if (nextOrderData.itemShipping) {
                const itemShipping = Number(nextOrderData.itemShipping);
                order.itemShipping = order.itemShipping - orderLine.itemShipping + itemShipping;
            }
            if (nextOrderData.toBeCollected) {
                const toBeCollected = Number(nextOrderData.toBeCollected);
                order.toBeCollected = order.toBeCollected - orderLine.toBeCollected + toBeCollected;
            }
            await order.save();
        }
        await OrderLine.update(nextOrderData, { where: { id: orderLineId } });
        return {
            data: "data updated successfully",
            status: true,
            statusCode: 200,
        };
    }
    static async updateNote(user, orderLineId, noteId, text) {
        const orderLine = await OrderLine.findByPk(orderLineId);
        if (!orderLine) {
            return {
                message: "Order Line not found",
                status: false,
                statusCode: 404,
            };
        }
        const note = (await Note.findByPk(noteId));
        if (!note) {
            return {
                message: "Note not found",
                status: false,
                statusCode: 404,
            };
        }
        if (user.userType === constants_1.USER_TYPES.VENDOR &&
            String(user.id) !== String(note.userId)) {
            return {
                message: "You are not authorized to update this note",
                status: false,
                statusCode: 403,
            };
        }
        note.text = text;
        await note.save();
        return {
            data: note,
            status: true,
            statusCode: 200,
        };
    }
    static async addNote(user, orderLineId, text) {
        const orderLine = await OrderLine.findByPk(orderLineId);
        if (!orderLine) {
            return {
                message: "Order Line not found",
                status: false,
                statusCode: 404,
            };
        }
        const newNote = await Note.create({
            entityId: orderLineId,
            entityType: "orderLine",
            text,
            userId: user.id,
        });
        return {
            data: newNote,
            status: true,
            statusCode: 200,
        };
    }
    static async deleteNote(user, orderLineId, noteId) {
        const orderLine = await OrderLine.findByPk(orderLineId);
        if (!orderLine) {
            return {
                message: "Order Line not found",
                status: false,
                statusCode: 404,
            };
        }
        const note = (await Note.findByPk(noteId));
        if (!note) {
            return {
                message: "Note not found",
                status: false,
                statusCode: 404,
            };
        }
        if (user.userType === constants_1.USER_TYPES.VENDOR &&
            String(user.id) !== String(note.userId)) {
            return {
                message: "You are not authorized to update this note",
                status: false,
                statusCode: 403,
            };
        }
        await Note.destroy({ where: { id: noteId } });
        return {
            message: "Note deleted successfully",
            status: true,
            statusCode: 200,
        };
    }
}
module.exports = OrderLineService;
//# sourceMappingURL=orderLine.service.js.map