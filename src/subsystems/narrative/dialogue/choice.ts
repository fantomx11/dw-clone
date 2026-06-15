import { Effect } from "./effect";

export interface Choice {
  text: string;
  nextNodeId: string | null; // null signifies that this choice ends the conversation
  effects?: Effect[]
}