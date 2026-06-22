import type { Equipment } from "../types/equipment";
import { fixtureListings } from "./fixtures";

export async function getListings(): Promise<Equipment[]> {
  // Fase 5: GET /api/market/list
  return fixtureListings;
}

export async function buy(itemId: string): Promise<void> {
  // Fase 5: POST /api/market/buy (transação autoritativa no backend)
  void itemId;
}

export async function sell(itemId: string, price: number): Promise<void> {
  // Fase 5: POST /api/market/sell
  void itemId; void price;
}

export async function unlist(itemId: string): Promise<void> {
  // Fase 5: POST /api/market/unlist — TODO: rota nova, ainda não existe no backend
  void itemId;
}