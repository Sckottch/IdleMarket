import type { Equipment } from "../types/equipment";
import { get, post } from "./api";

export async function getListings(): Promise<Equipment[]> {
  const data = await get<Equipment[]>("/market/list")
  return data
}

export async function buy(itemId: string): Promise<void> {
  await post<void>("/market/buy", { itemId })
}

export async function sell(itemId: string, price: number): Promise<void> {
  await post<void>("/market/sell", { itemId, price })
}

export async function unlist(itemId: string): Promise<void> {
  await post<void>("/market/unlist", { itemId })
}