import { FunctionDefinition, Token, TokenType } from "./types";

export const allowedFunctions: { [key: string]: FunctionDefinition } = {
  // --- Core Engine Bootstrap Commands ---
  'SET_CURRENT_REGION': { min: 1, max: 1, alias: "state.setCurrentRegion" },
  'SET_CURRENT_LOCATION': { min: 1, max: 1, alias: "state.setCurrentLocation" },
  'SET_CURRENT_SUBNODE': { min: 1, max: 1, alias: "state.setCurrentSubNode" },

  // --- Text & UI ---
  'DISPLAY_TEXT': { min: 1, max: 1, alias: "displayText" },

  // --- Quest Flags (Replacing SET_GAME_STATE_VARIABLE) ---
  'SET_FLAG': { min: 2, max: 2, alias: "setFlag" },
  'GET_FLAG': { min: 1, max: 1, alias: "getFlag" },

  // --- Dragon Quest Progression Systems ---
  'GIVE_ITEM': { min: 1, max: 1, alias: "giveItem" },
  'REMOVE_ITEM': { min: 1, max: 1, alias: "removeItem" },
  'PLAYER_HAS_ITEM': { min: 1, max: 1, alias: "playerHasItem" },
  'ADD_GOLD': { min: 1, max: 1, alias: "addGold" },
  'ADD_XP': { min: 1, max: 1, alias: "addXp" },
  'GET_STAT': { min: 1, max: 1, alias: "getStat" },

  // --- World & Combat State Switching ---
  'MOVE_TO_LOCATION': { min: 1, max: 1, alias: "moveToLocation" },
  'TRIGGER_COMBAT': { min: 1, max: 1, alias: "triggerCombat" }
};

export const allowedGlobals = new Map([
  ["PLAYER", "player"],
  ["TRUE", "true"],
  ["FALSE", "false"],
  ["NULL", "null"]
]);

const keywords = new Set([
  'BLOCK',
  'CONST',
  'CHOICE',
  'CONNECTIONS',
  'DEFAULT',
  'DIALOGUE_TREE',
  'ELSE',
  'END',
  'FOR',
  'GOTO',
  'IF',
  'ITEM',
  'LOCATION',
  'MONSTER',
  'MONSTERS',
  'NODE',
  'NPC',
  'NPCS',
  'ON',
  'EXECUTE',
  'REGION',
  'RETURN',
  'ROUTER',
  'START',
  'SUBNODE',
  'THEN',
  'VAR'
]);

export const assignmentOperators = new Set(['=']);
export const arithmaticOperators = new Set(['+', '-', '*', '/']);
export const comparisonOperators = new Set(['=', '+', '-', '*', '/', '<', '>', '<=', '>=', '==', '!=']);
export const unaryOperators = new Set(['NOT']);
export const logicalOperators = new Set(['AND', 'OR']);
export const punctuators = new Set(['(', ')', ',']);

export const tokenize = (code: string) => {
  const tokens: Token[] = [];
  const regex = /([a-zA-Z_][a-zA-Z0-9_]*)|(\()|(\))|(,)|(<=|>=|==|!=|=|<|>|\+|-|\*|\/)|(".*?")|('.*?')|([0-9]+(?:\.[0-9]+)?)/g;

  const lines = code.split(/\n|\r|\r\n/);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        const invalidToken = line.substring(lastIndex, match.index).trim();
        if (invalidToken.length > 0) {
          throw new Error(`Syntax Error on line ${lineIndex + 1}: Unexpected token '${invalidToken}'.`);
        }
      }

      let tokenValue: string | number = match[0].trim();
      if (tokenValue.length === 0) continue;

      let tokenType = TokenType.UNKNOWN;

      const normalizedValue = tokenValue.toUpperCase();

      if (keywords.has(normalizedValue)) {
        tokenType = TokenType.WORD;
      } else if (allowedFunctions[normalizedValue] !== void 0) {
        tokenType = TokenType.FUNCTION;
      } else if (assignmentOperators.has(tokenValue)) {
        tokenType = TokenType.ASSIGNMENT_OPERATOR;
      } else if (arithmaticOperators.has(tokenValue)) {
        tokenType = TokenType.ARITHMATIC_OPERATOR;
      } else if (comparisonOperators.has(tokenValue)) {
        tokenType = TokenType.COMPARISON_OPERATOR;
      } else if (logicalOperators.has(tokenValue)) {
        tokenType = TokenType.LOGICAL_OPERATOR;
      } else if (punctuators.has(tokenValue)) {
        tokenType = TokenType.PUNCTUATOR;
      } else if (unaryOperators.has(tokenValue)) {
        tokenType = TokenType.UNARY_OPERATOR;
      } else if (match[6] || match[7]) {
        tokenValue = tokenValue.slice(1, -1);
        tokenType = TokenType.LITERAL;      
      } else if (match[8]) {
        tokenValue = Number(tokenValue);
        tokenType = TokenType.LITERAL;
      } else if (match[1]) {
        tokenType = TokenType.WORD;
      }

      if (tokenType !== TokenType.UNKNOWN) {
        tokens.push({ type: tokenType, value: tokenValue, normalizedValue: normalizedValue, line: lineIndex + 1 });
      }

      lastIndex = regex.lastIndex;
    }
    if (lastIndex < line.length) {
      const invalidToken = line.substring(lastIndex).trim();
      if (invalidToken.length > 0) {
        throw new Error(`Syntax Error on line ${lineIndex + 1}: Unexpected token '${invalidToken}'.`);
      }
    }
  }

  return tokens;
};

export function consume(tokens: Token[], expectedType: TokenType, expectedValue?: string) {
  const token = tokens[0];
  const normalizedExpectedValue = expectedValue ? expectedValue.toUpperCase() : null;

  if (!token) {
    throw new Error(`Syntax Error: Unexpected end of input. Expected a token of type '${expectedType}'${expectedValue ? ` with value '${expectedValue}'` : ''} but reached the end of the file.`);
  }

  if (token && token.type === expectedType && (!normalizedExpectedValue || token.normalizedValue === normalizedExpectedValue)) {
    tokens.shift();
    return token;
  }

  throw new Error(
    `Syntax Error on line ${token.line}: Expected Type [${expectedType}] with value '${expectedValue || ''}', ` +
    `but found Type [${token.type}] with value '${token.value}'.`
  );
};
