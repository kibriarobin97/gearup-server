import { OrderStatus } from "../../../generated/prisma/enums";

export interface ICreateRentalOrderPayload {
  gearId: string;
  startTime: string;
  endTime: string;
  quantity: number;
}

export interface IUpdateOrderStatusPayload {
  status: OrderStatus;
}