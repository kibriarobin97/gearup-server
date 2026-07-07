
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
  totalStock?: number;
}

export interface IGearQuery {
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  searchItem?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}
