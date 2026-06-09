export enum EffectType {
  AddItem = "ADD_ITEM",
  RemoveItem = "REMOVE_ITEM",
  DiscoverLocation = "DISCOVER_LOCATION",
  Teleport = "TELEPORT",
  SetFlag = "SET_FLAG",
  TriggerEncounter = "TRIGGER_ENCOUNTER"
}

interface EffectPayloads {
  [EffectType.AddItem]: { itemId: string; count?: number };
  [EffectType.RemoveItem]: { itemId: string; count?: number };
  [EffectType.DiscoverLocation]: { locationId: string; };
  [EffectType.Teleport]: { locationId: string; subNodeId?: string; };
  [EffectType.SetFlag]: { flagKey: string; value: boolean | string | number; };
  [EffectType.TriggerEncounter]: { monsterId: string; };
}

export type Effect = {
  [K in EffectType]: { type: K } & EffectPayloads[K]
}[EffectType];