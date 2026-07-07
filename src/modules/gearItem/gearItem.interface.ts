export interface ICreateGearPayload {
  name: string;
  description: string;
  pricePerDay: number;
  brand?: string;
  model?: string;
  totalStock?: number;
  categoryId: string;
}

export interface IUpdateGearPayload {
  name?: string;
  description?: string;
  pricePerDay?: number;
  brand?: string;
  model?: string;
  categoryId?: string;
}
