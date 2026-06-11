export enum ExplorationResultType {
  LocationRevealed,
  Encounter,
  NoEvent
}

export interface ExplorationRates {
  locationRevealChance: number;
  encounterChance: number;
  noEventChance: number;
}

interface BaseExplorationResult {
  type: ExplorationResultType;
}

interface LocationRevealResult extends BaseExplorationResult {
  type: ExplorationResultType.LocationRevealed;
  locationId: string;
}

interface EncounterResult extends BaseExplorationResult {
  type: ExplorationResultType.Encounter;
  monsterId: string;
}

interface NoEventResult extends BaseExplorationResult {
  type: ExplorationResultType.NoEvent;
}

export type ExplorationResult = LocationRevealResult | EncounterResult | NoEventResult;