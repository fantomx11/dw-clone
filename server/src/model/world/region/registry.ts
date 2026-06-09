import { createRegistry, EventBus, EventType } from "@/core";
import { Region } from "./region";

export const Registry = createRegistry<Region>();