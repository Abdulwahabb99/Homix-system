import type { Request, Response } from "express";

import { unwrap } from "../../shared/result";
import type { ShipmentService } from "./shipment.service";

export class ShipmentController {
  public constructor(private readonly shipmentService: ShipmentService) {}

  public getMeta = async (_request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.getMeta()), status: true });
  };

  public getSummary = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.getSummary(request.query as never, request.vendorId)), status: true });
  };

  public listShipments = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.listShipments(request.query as never, request.vendorId)), status: true });
  };

  public getShipmentById = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.getShipmentById(Number(request.params.shipmentId), request.vendorId)), status: true });
  };

  public listVendorReturns = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.listVendorReturns(request.query as never, request.vendorId)), status: true });
  };

  public listCustomerReturns = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.listCustomerReturns(request.query as never, request.vendorId)), status: true });
  };

  public listInventory = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.listInventory(request.query as never, request.vendorId)), status: true });
  };

  public listDeliveryAccounts = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.listDeliveryAccounts(request.query as never, request.vendorId)), status: true });
  };

  public listExpenseAccounts = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.listExpenseAccounts(request.query as never)), status: true });
  };

  public getPerformance = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.getPerformance(request.query as never, request.vendorId)), status: true });
  };

  public updateShipment = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.updateShipment(Number(request.params.shipmentId), request.body)), status: true });
  };

  public deleteShipment = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ ...unwrap(await this.shipmentService.deleteShipment(Number(request.params.shipmentId))), status: true });
  };

  public addNote = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.addNote(Number(request.params.shipmentId), String(request.body.text), request.user ?? { id: 0 })), status: true });
  };

  public updateNote = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ data: unwrap(await this.shipmentService.updateNote(Number(request.params.shipmentId), Number(request.params.noteId), String(request.body.text), request.user ?? { id: 0 })), status: true });
  };

  public deleteNote = async (request: Request, response: Response): Promise<void> => {
    response.status(200).json({ ...unwrap(await this.shipmentService.deleteNote(Number(request.params.shipmentId), Number(request.params.noteId), request.user ?? { id: 0 })), status: true });
  };
}
