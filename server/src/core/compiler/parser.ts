import { snakeToCamelCase } from "@/util";
import { consume, allowedFunctions, allowedGlobals } from "./tokenizer";
import { ParsingContext, BlockStatementNode, TokenType, NodeType, VariableStatementNode, ConstantStatementNode, IfStatementNode, ReturnStatementNode, OnEventStatementNode, CallExpressionNode, AssignmentExpressionNode, ExpressionNode, BinaryExpressionNode, UnaryExpressionNode, StatementNode, Token, ProgramNode, DefinitionStatementNode, ChoiceExpressionNode, DialogueNodeStatementNode, DialogueTreeStatementNode, DialogueRoute } from "./types";

export function parseBlock(parsingContext: ParsingContext): BlockStatementNode {
  const { tokens, variables, constants } = parsingContext;

  consume(tokens, TokenType.KEYWORD, 'BLOCK');

  const newParsingContext = {
    tokens,
    constants: new Set(constants),
    variables: new Set(variables)
  }

  const block = [];

  while (tokens.length > 0 && tokens[0].normalizedValue !== 'END') {
    block.push(parseStatement(newParsingContext));
  }

  consume(tokens, TokenType.KEYWORD, 'END');
  consume(tokens, TokenType.KEYWORD, 'BLOCK');

  return { type: NodeType.BlockStatement, block };
}

export function parseVarStatement(parsingContext: ParsingContext): VariableStatementNode {
  const { tokens, variables, constants } = parsingContext;

  consume(tokens, TokenType.KEYWORD, "VAR");

  const varName = consume(tokens, TokenType.IDENTIFIER).normalizedValue;
  variables.add(varName);

  let value = null;
  if (tokens[0] && tokens[0].value === '=') {
    consume(tokens, TokenType.ASSIGNMENT_OPERATOR);
    value = parseLogicalExpression(parsingContext);
  }

  return { type: NodeType.VariableStatement, name: varName, value: value };
}

export function parseConstStatement(parsingContext: ParsingContext): ConstantStatementNode {
  const { tokens } = parsingContext;
  const token = tokens[0];

  consume(tokens, TokenType.KEYWORD, 'CONST');

  const constName = consume(tokens, TokenType.IDENTIFIER).normalizedValue;

  consume(tokens, TokenType.ASSIGNMENT_OPERATOR, '=');

  const value = parseLogicalExpression(parsingContext);

  if (parsingContext.constants.has(constName)) {
    throw new Error(`Syntax Error on line ${token.line}: Constant '${constName}' has already been declared.`);
  }
  parsingContext.constants.add(constName);

  return { type: NodeType.ConstantStatement, name: constName, value: value };
}

export function parseIfStatement(parsingContext: ParsingContext): IfStatementNode {
  const { tokens } = parsingContext;

  consume(tokens, TokenType.KEYWORD, 'IF');

  const test = parseLogicalExpression(parsingContext);

  consume(tokens, TokenType.KEYWORD, 'THEN');

  const consequent = parseStatement(parsingContext);

  let alternate = null;
  if (tokens[0] && tokens[0].normalizedValue === 'ELSE') {
    consume(tokens, TokenType.KEYWORD, 'ELSE');

    alternate = parseStatement(parsingContext);
  }
  return { type: NodeType.IfStatement, test, consequent, alternate };
}

export function parseReturnStatement(parsingContext: ParsingContext): ReturnStatementNode {
  consume(parsingContext.tokens, TokenType.KEYWORD, "RETURN");

  const value = parseLogicalExpression(parsingContext);

  return { type: NodeType.ReturnStatement, value };
}

export function parseOnStatement(parsingContext: ParsingContext): OnEventStatementNode {
  consume(parsingContext.tokens, TokenType.KEYWORD, "ON");

  const eventName = consume(parsingContext.tokens, TokenType.LITERAL).value;

  const body = parseStatement(parsingContext);

  if(typeof eventName !== 'string') throw new Error("Expected a string for event name");

  return { type: NodeType.OnEventStatement, eventName, body };
}

export function parseDefinitionStatement(parsingContext: ParsingContext): any {
  const { tokens } = parsingContext;

  // 1. If this is the outer block call, it might start with START (e.g., START REGION)
  if (tokens[0] && tokens[0].normalizedValue === 'START') {
    consume(tokens, TokenType.KEYWORD, 'START');
  }

  // 2. Grab the block type name (e.g., REGION, LOCATION, SUBNODE)
  const defTypeToken = tokens.shift()!;
  const defType = defTypeToken.normalizedValue;

  // 3. Grab the unique ID anchor (handles unquoted identifiers or quoted strings)
  const idToken = tokens.shift()!;
  const id = idToken.type === TokenType.LITERAL ? idToken.value : idToken.normalizedValue;

  const properties: Record<string, any> = {};

  // 4. Run the property harvest loop until hitting the outer block's 'END [defType]'
  while (tokens.length > 0 && !(tokens[0].normalizedValue === 'END' && tokens[1]?.normalizedValue === defType)) {
    const peek = tokens[0];

    // STRUCTURE A: We found a 'START' keyword -> This is a multi-line array or sub-block!
    if (peek && peek.normalizedValue === 'START') {
      consume(tokens, TokenType.KEYWORD, 'START');

      const innerKeyToken = tokens.shift()!;
      const innerKey = innerKeyToken.normalizedValue;

      // Lookahead check: Is this a nested sub-definition block (like START SUBNODE "throne_room")?
      // If the token following the key is followed by an asset ID string/identifier instead of a value
      // OR if the innerKey matches a known block type, we parse it recursively!
      if (innerKey === 'SUBNODE' || innerKey === 'LOCATION' || innerKey === 'NPC') {
        // Put the innerKey back so the recursive parseDefinition call can consume it cleanly
        tokens.unshift(innerKeyToken);

        if (!properties[snakeToCamelCase(innerKey)]) properties[snakeToCamelCase(innerKey)] = [];
        properties[snakeToCamelCase(innerKey)].push(parseDefinitionStatement(parsingContext));
        continue;
      }

      // Otherwise, it's a primitive array (like START MONSTERS ... END MONSTERS)
      const arrayItems: any[] = [];
      while (tokens.length > 0 && !(tokens[0].normalizedValue === 'END' && tokens[1]?.normalizedValue === innerKey)) {
        const itemToken = tokens.shift()!;
        arrayItems.push(itemToken.type === TokenType.LITERAL ? itemToken.value : itemToken.value);
      }

      // Close out the array block boundaries
      consume(tokens, TokenType.KEYWORD, 'END');
      consume(tokens, TokenType.KEYWORD, innerKey);

      properties[snakeToCamelCase(innerKey)] = arrayItems;
      continue;
    }

    // STRUCTURE B: Regular flat line attribute assignment (e.g., NAME "Tantegel Castle")
    const keyToken = tokens.shift()!;
    const key = keyToken.normalizedValue;

    const valueToken = tokens.shift()!;
    properties[snakeToCamelCase(key)] = valueToken.type === TokenType.LITERAL ? valueToken.value : valueToken.value;
  }

  // 5. Clean up the trailing outer block boundary tokens
  consume(tokens, TokenType.KEYWORD, 'END');
  consume(tokens, TokenType.KEYWORD, defType);

  return {
    type: NodeType.DefinitionStatement,
    defType,
    id,
    properties
  };
}

function parseDialogueTree(parsingContext: ParsingContext): DialogueTreeStatementNode {
  const { tokens } = parsingContext;

  consume(tokens, TokenType.KEYWORD, 'DIALOGUE_TREE');
  const treeId = consume(tokens, TokenType.IDENTIFIER).normalizedValue;

  const routes: DialogueRoute[] = [];
  const nodes: DialogueNodeStatementNode[] = [];

  // Parse contents until hitting "END DIALOGUE_TREE"
  while (tokens.length > 0 && !(tokens[0].normalizedValue === 'END' && tokens[1]?.normalizedValue === 'DIALOGUE_TREE')) {
    const currentToken = tokens[0];

    // CASE A: Parse localized routing statements
    if (currentToken.normalizedValue === 'ROUTE') {
      consume(tokens, TokenType.KEYWORD, 'ROUTE');

      if (tokens[0].normalizedValue === 'IF') {
        consume(tokens, TokenType.KEYWORD, 'IF');
        const condition = parseLogicalExpression(parsingContext);

        consume(tokens, TokenType.KEYWORD, 'THEN');
        consume(tokens, TokenType.KEYWORD, 'GOTO');
        const targetNodeId = consume(tokens, TokenType.IDENTIFIER).normalizedValue;

        routes.push({ isDefault: false, condition, targetNodeId });

      } else if (tokens[0].normalizedValue === 'DEFAULT') {
        consume(tokens, TokenType.KEYWORD, 'DEFAULT');
        consume(tokens, TokenType.KEYWORD, 'GOTO');
        const targetNodeId = consume(tokens, TokenType.IDENTIFIER).normalizedValue;

        routes.push({ isDefault: true, condition: null, targetNodeId });
      }
      continue;
    }

    // CASE B: Parse standard dialogue node blocks
    if (currentToken.normalizedValue === 'NODE') {
      nodes.push(parseDialogueNode(parsingContext));
      continue;
    }

    throw new Error(`Syntax Error on line ${currentToken.line}: Expected 'ROUTE' or 'NODE' inside DIALOGUE_TREE, but found '${currentToken.value}'.`);
  }

  consume(tokens, TokenType.KEYWORD, 'END');
  consume(tokens, TokenType.KEYWORD, 'DIALOGUE_TREE');

  return {
    type: NodeType.DialogueTreeStatement,
    treeId,
    targetNpcId: treeId, // Mapping target directly to treeId under the unified layout
    routes,
    nodes
  };
}

function parseDialogueNode(parsingContext: ParsingContext): DialogueNodeStatementNode {
  const { tokens } = parsingContext;

  consume(tokens, TokenType.KEYWORD, 'NODE');
  const nodeId = consume(tokens, TokenType.IDENTIFIER).normalizedValue;

  let text = '';
  const choices: ChoiceExpressionNode[] = [];
  let onExecute: StatementNode | null = null;

  // Parse elements inside the node body until hitting "END NODE"
  while (tokens.length > 0 && !(tokens[0].normalizedValue === 'END' && tokens[1]?.normalizedValue === 'NODE')) {
    const token = tokens[0];

    if (token.normalizedValue === 'TEXT') {
      consume(tokens, TokenType.IDENTIFIER, 'TEXT');

      const token = consume(tokens, TokenType.LITERAL);

      if(typeof token.value !== "string") throw new Error("Expected a string for text value");

      text = token.value;
    } else if (token.normalizedValue === 'CHOICE') {
      choices.push(parseChoiceExpression(parsingContext));
    } else if (token.normalizedValue === 'ON_EXECUTE') {
      consume(tokens, TokenType.KEYWORD, 'ON_EXECUTE');
      // This reuse lets you pass single commands OR full "BLOCK ... END BLOCK" scripts safely!
      onExecute = parseStatement(parsingContext);
    } else {
      throw new Error(`Syntax Error on line ${token.line}: Unexpected element '${token.value}' inside NODE.`);
    }
  }

  consume(tokens, TokenType.KEYWORD, 'END');
  consume(tokens, TokenType.KEYWORD, 'NODE');

  return { type: NodeType.DialogueNodeStatement, nodeId, text, choices, onExecute };
}

function parseChoiceExpression(parsingContext: ParsingContext): ChoiceExpressionNode {
  const { tokens } = parsingContext;

  consume(tokens, TokenType.KEYWORD, 'CHOICE');
  const text = consume(tokens, TokenType.LITERAL).value;

  // Handle optional conditional requirements: CHOICE "Buy" IF GET_STAT("GOLD") > 10 THEN GOTO...
  let condition: ExpressionNode | null = null;
  if (tokens[0] && tokens[0].normalizedValue === 'IF') {
    consume(tokens, TokenType.KEYWORD, 'IF');
    condition = parseLogicalExpression(parsingContext);
  }

  consume(tokens, TokenType.KEYWORD, 'THEN');
  consume(tokens, TokenType.KEYWORD, 'GOTO');

  const targetNodeId = consume(tokens, TokenType.IDENTIFIER).normalizedValue;

  if(typeof text !== "string") throw new Error("Expected a string for choice text");

  return { type: NodeType.ChoiceExpression, text, targetNodeId, condition };
}

export function parseCallExpression(parsingContext: ParsingContext): CallExpressionNode {
  const { tokens } = parsingContext;
  const funcToken = consume(tokens, TokenType.FUNCTION);
  const funcName = funcToken.normalizedValue;

  consume(tokens, TokenType.PUNCTUATOR, '(');

  const args = [];

  while (tokens[0] && tokens[0].value !== ')') {
    if(tokens[0].value === ',') consume(tokens, TokenType.PUNCTUATOR, ',');
    
    args.push(parseLogicalExpression(parsingContext));
  }

  consume(tokens, TokenType.PUNCTUATOR, ')');

  const funcMeta = allowedFunctions[funcName];

  if (args.length < funcMeta.min || args.length > funcMeta.max) {
    throw new Error(`Syntax Error on line ${funcToken.line}: Invalid number of arguments for '${funcName}'. Expected ${funcMeta.min}-${funcMeta.max}, but got ${args.length}.`);
  }

  return { type: NodeType.CallExpression, funcName, arguments: args };
}

export function parseAssignmentExpression(parsingContext: ParsingContext): AssignmentExpressionNode {
  const token = parsingContext.tokens[0];

  const { normalizedValue: identifier, value } = consume(parsingContext.tokens, TokenType.IDENTIFIER);

  if (!parsingContext.variables.has(identifier)) {
    throw new Error(`Syntax Error on line ${token.line}: Cannot assign to an undeclared variable: '${value}'.`);
  }

  consume(parsingContext.tokens, TokenType.ASSIGNMENT_OPERATOR);

  const expression = parseLogicalExpression(parsingContext);

  return { type: NodeType.AssignmentExpression, identifier, expression };
}

export function parseArithmaticExpression(parsingContext: ParsingContext): ExpressionNode {
  const { tokens } = parsingContext;

  let left = parseTerm(parsingContext);

  while (tokens[0] && tokens[0].type === TokenType.ARITHMATIC_OPERATOR) {
    const operator = consume(tokens, TokenType.ARITHMATIC_OPERATOR).normalizedValue;

    const right = parseTerm(parsingContext);

    left = { type: NodeType.BinaryExpression, left, operator, right };
  }
  return left;
};

export function parseLogicalExpression(parsingContext: ParsingContext): ExpressionNode {
  const { tokens } = parsingContext;
  const token = tokens[0];

  let left = null;

  if (token.type === TokenType.PUNCTUATOR) {
    consume(tokens, TokenType.PUNCTUATOR, '(');
    left = parseLogicalExpression(parsingContext);
    consume(tokens, TokenType.PUNCTUATOR, ')');
  } else if (token.type === TokenType.FUNCTION)
    left = parseCallExpression(parsingContext);
  else if (token.type === TokenType.IDENTIFIER && tokens[1].type === TokenType.ASSIGNMENT_OPERATOR)
    left = parseAssignmentExpression(parsingContext);
  else if ((token.type === TokenType.IDENTIFIER || token.type === TokenType.LITERAL) && tokens[1].type === TokenType.COMPARISON_OPERATOR)
    left = parseComparisonExpression(parsingContext);
  else if ((token.type === TokenType.IDENTIFIER || token.type === TokenType.LITERAL) && tokens[1].type === TokenType.ARITHMATIC_OPERATOR)
    left = parseArithmaticExpression(parsingContext);
  else if (token.type === TokenType.UNARY_OPERATOR)
    left = parseUnaryExpression(parsingContext);
  else if (token.type === TokenType.LITERAL || token.type === TokenType.IDENTIFIER)
    left = parseTerm(parsingContext);

  if (left === null) {
    throw new Error(`Syntax Error on line ${token.line}: Cannot parse expression.`);
  }

  while (tokens[0] && (tokens[0].type === TokenType.LOGICAL_OPERATOR || tokens[0].type === TokenType.COMPARISON_OPERATOR || tokens[0].type === TokenType.ARITHMATIC_OPERATOR)) {
    var operator = tokens[0].normalizedValue === "AND" ? "&&" : tokens[0].normalizedValue === "OR" ? "||" : tokens[0].normalizedValue;
    tokens.shift();

    const right = parseLogicalExpression(parsingContext);

    left = <BinaryExpressionNode>{ type: NodeType.BinaryExpression, left, operator, right };
  }

  return left;
};

export function parseUnaryExpression(parsingContext: ParsingContext): UnaryExpressionNode {
  let token = consume(parsingContext.tokens, TokenType.UNARY_OPERATOR);

  if (token.normalizedValue === 'NOT') {
    var argument = parseTerm(parsingContext);
    return { type: NodeType.UnaryExpression, operator: '!', argument: argument };
  }

  throw new Error("Unary operator " + token.value + " not implemented.");
}

export function parseComparisonExpression(parsingContext: ParsingContext): ExpressionNode {
  const { tokens } = parsingContext;

  let left = parseLogicalExpression(parsingContext);

  while (tokens[0] && tokens[0].type === TokenType.COMPARISON_OPERATOR) {
    const operator = consume(tokens, TokenType.COMPARISON_OPERATOR).normalizedValue;

    const right = parseLogicalExpression(parsingContext);

    left = { type: NodeType.BinaryExpression, left, operator, right };
  }
  return left;
};

export function parseStatement(parsingContext: ParsingContext): StatementNode {
  const { tokens, variables, constants } = parsingContext;

  const token = tokens[0];

  if (!token) throw new Error("Unexpected end of input.");

  switch (token.normalizedValue) {
    case 'VAR': return parseVarStatement(parsingContext);
    case 'BLOCK': return parseBlock(parsingContext);
    case 'CONST': return parseConstStatement(parsingContext);
    case 'IF': return parseIfStatement(parsingContext);
    case 'RETURN': return parseReturnStatement(parsingContext);
    case 'ON': return parseOnStatement(parsingContext);
    case 'START': return parseDefinitionStatement(parsingContext);
    case 'DIALOGUE_TREE': return parseDialogueTree(parsingContext);
  }

  if (token.type === 'FUNCTION') return parseCallExpression(parsingContext);
  if (token.type === 'IDENTIFIER') return parseAssignmentExpression(parsingContext);

  throw new Error(`Syntax Error on line ${token.line}: Invalid statement starting with token: '${token.value}'.`);
};

export function parseTerm(parsingContext: ParsingContext): ExpressionNode {
  const { tokens } = parsingContext;

  const token = tokens[0];

  if (!token) throw new Error("Unexpected end of input.");

  if (token.value === '(') {
    tokens.shift();
    const expr = parseLogicalExpression(parsingContext);
    consume(tokens, TokenType.PUNCTUATOR, ')');
    return expr;
  }
  if (token.normalizedValue === 'NOT') {
    tokens.shift();
    const argument = parseTerm(parsingContext);
    return { type: NodeType.UnaryExpression, operator: '!', argument };
  }
  if (token.type === 'FUNCTION') {
    return parseCallExpression(parsingContext);
  }
  if (token.type === 'LITERAL') {
    tokens.shift();
    const value = token.value;
    return { type: NodeType.LiteralExpression, value: value };
  }
  if (token.type === 'IDENTIFIER') {
    tokens.shift();
    if (allowedFunctions[token.normalizedValue] === void 0 && !allowedGlobals.has(token.normalizedValue) && !parsingContext.variables.has(token.normalizedValue) && !parsingContext.constants.has(token.normalizedValue)) {
      throw new Error(`Syntax Error on line ${token.line}: Undeclared identifier: '${token.value}'.`);
    }
    return { type: NodeType.IdentifierExpression, name: token.normalizedValue };
  }

  throw new Error(`Syntax Error on line ${token.line}: Invalid expression: '${token.value}'.`);
};

export function parseTokens(tokens: Token[]): ProgramNode {
  const ast: ProgramNode = { type: NodeType.Program, body: [] };

  const parsingContext: ParsingContext = {
    tokens,
    variables: new Set(),
    constants: new Set()
  }

  while (tokens.length > 0) {
    ast.body.push(parseStatement(parsingContext));
  }

  return ast;
};