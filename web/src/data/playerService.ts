import type { Equipment } from "../types/equipment";
import type { PlayerStatus } from "../types/player";
import { fixtureInventory, fixturePlayer } from "./fixtures";

export type PlayerData = {
    status: PlayerStatus;
    inventory: Equipment[];
}

export async function getMe(): Promise<PlayerData> {
    return { status: fixturePlayer, inventory: fixtureInventory}
}