import type { Equipment } from "../types/equipment";
import type { PlayerStatus } from "../types/player";
import { get } from "./api";

export type PlayerData = {
    status: PlayerStatus;
    inventory: Equipment[];
}

export async function getMe(): Promise<PlayerData> {
    const data = await get<PlayerData>("/player/me")
    return data
}