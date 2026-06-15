import { GameState } from "../../subsystems/state/gameState";

export type ConditionConfig = {
  [operator: string]: any;
};

// Map operators to their execution functions
const operators: Record<string, (val: any, state: GameState) => boolean> = {
  // Direct flag lookup: {"flag": "talked_to_king"}
  "flag": (flagKey: string, state: GameState) => { return !!state.flags[flagKey];  },

  // Logical negation: {"not": { "flag": "talked_to_king" }}
  "not": (subCondition: ConditionConfig, state: GameState) => { return !evaluateCondition(subCondition, state); },

  // Logical AND: {"and": [{"flag": "flag1"}, {"flag": "flag2"}]}
  "and": (subConditions: ConditionConfig[], state: GameState) => { return subConditions.every(cond => evaluateCondition(cond, state)); },
  
  // Logical OR: {"or": [{"flag": "flag1"}, {"flag": "flag2"}]}
  "or": (subConditions: ConditionConfig[], state: GameState) => { return subConditions.some(cond => evaluateCondition(cond, state)); },

  // Stat comparisons, e.g., {"level_gt": 5}
  "level_gt": (targetLevel: number, state: GameState) => {
    // Assuming you'll add a player level to gameState later
    // return (state.player?.level ?? 1) > targetLevel;
    return false; 
  }

// true
// false
// and
// or
// not
// =
// >
// <




};

export function evaluateCondition(condition: ConditionConfig | undefined, state: GameState): boolean {
  if (!condition || Object.keys(condition).length === 0) {
    return true;
  }

  // Evaluate each key in the object block (treating multiple keys as an implicit AND)
  for (const [operator, value] of Object.entries(condition)) {
    const runner = operators[operator];
    if (!runner) {
      throw new Error(`Unknown condition operator: "${operator}"`);
    }

    // If any single operator rule fails, the whole block fails
    if (!runner(value, state)) {
      return false;
    }
  }

  return true;
}