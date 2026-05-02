import { USER_TYPES } from "../../../config/constants";

const Note = require("../notes/notes.model") as typeof import("../notes/notes.model");
const Order = require("../order/order.model") as typeof import("../order/order.model");
const OrderLine = require("./orderline.model") as typeof import("./orderline.model");

type UserContext = {
  id: number | string;
  userType?: string;
};

type NoteRecord = {
  save: () => Promise<void>;
  text: string;
  toJSON?: () => unknown;
  userId: number | string;
};

type OrderRecord = {
  itemShipping: number;
  save: () => Promise<void>;
  toBeCollected: number;
  totalCost: number;
};

type OrderLineRecord = {
  cost: number;
  itemShipping: number;
  orderId: number | string;
  quantity: number;
  toBeCollected: number;
};

type OrderLineUpdateInput = {
  color?: string;
  cost?: number;
  itemShipping?: number;
  itemStatus?: number;
  material?: string;
  notes?: string;
  size?: string;
  status?: number;
  toBeCollected?: number;
  unitCost?: number;
};

type ServiceResponse = {
  data?: unknown;
  message?: string;
  status: boolean;
  statusCode: number;
};

const removeUndefinedFields = (payload: OrderLineUpdateInput): OrderLineUpdateInput => {
  const nextPayload = { ...payload };

  Object.keys(nextPayload).forEach((key) => {
    const typedKey = key as keyof OrderLineUpdateInput;
    if (nextPayload[typedKey] === undefined || nextPayload[typedKey] === null) {
      delete nextPayload[typedKey];
    }
  });

  return nextPayload;
};

class OrderLineService {
  public static async updateOrderLine(
    orderLineId: string,
    orderData: OrderLineUpdateInput,
  ): Promise<ServiceResponse> {
    if (Object.keys(orderData).length === 0) {
      return {
        message: "Please provide the data to update",
        status: false,
        statusCode: 400,
      };
    }

    const orderLine = (await OrderLine.findByPk(orderLineId)) as OrderLineRecord | null;
    if (!orderLine) {
      return {
        message: "Order Line not found",
        status: false,
        statusCode: 404,
      };
    }

    const nextOrderData = removeUndefinedFields(orderData);
    if (nextOrderData.cost || nextOrderData.itemShipping || nextOrderData.toBeCollected) {
      const order = (await Order.findByPk(orderLine.orderId)) as OrderRecord | null;
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

  public static async updateNote(
    user: UserContext,
    orderLineId: string,
    noteId: string,
    text: string,
  ): Promise<ServiceResponse> {
    const orderLine = await OrderLine.findByPk(orderLineId);
    if (!orderLine) {
      return {
        message: "Order Line not found",
        status: false,
        statusCode: 404,
      };
    }

    const note = (await Note.findByPk(noteId)) as NoteRecord | null;
    if (!note) {
      return {
        message: "Note not found",
        status: false,
        statusCode: 404,
      };
    }

    if (
      user.userType === USER_TYPES.VENDOR &&
      String(user.id) !== String(note.userId)
    ) {
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

  public static async addNote(
    user: UserContext,
    orderLineId: string,
    text: string,
  ): Promise<ServiceResponse> {
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

  public static async deleteNote(
    user: UserContext,
    orderLineId: string,
    noteId: string,
  ): Promise<ServiceResponse> {
    const orderLine = await OrderLine.findByPk(orderLineId);
    if (!orderLine) {
      return {
        message: "Order Line not found",
        status: false,
        statusCode: 404,
      };
    }

    const note = (await Note.findByPk(noteId)) as NoteRecord | null;
    if (!note) {
      return {
        message: "Note not found",
        status: false,
        statusCode: 404,
      };
    }

    if (
      user.userType === USER_TYPES.VENDOR &&
      String(user.id) !== String(note.userId)
    ) {
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

export = OrderLineService;
