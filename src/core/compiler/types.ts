export interface Token {
  type: TokenType;
  value: string | number;
  normalizedValue: string
  line: number
}

export interface FunctionDefinition {
  min: number;
  max: number;
  alias: string;
}

export enum TokenType {
  WORD = "WORD",
  FUNCTION = "FUNCTION",
  ASSIGNMENT_OPERATOR = 'ASSSIGNMENT_OPERATOR',
  ARITHMATIC_OPERATOR = 'ARITHMATIC_OPERATOR',
  COMPARISON_OPERATOR = 'COMPARISON_OPERATOR',
  LOGICAL_OPERATOR = 'LOGICAL_OPERATOR',
  PUNCTUATOR = 'PUNCTUATOR',
  LITERAL = 'LITERAL',
  UNARY_OPERATOR = 'UNARY_OPERATOR',
  UNKNOWN = 'UNKNOWN'
}

export enum NodeType {
  Program,

  VariableStatement,
  BlockStatement,
  ConstantStatement,
  IfStatement,
  ReturnStatement,
  OnEventStatement,
  DefinitionStatement,
  DialogueTreeStatement,
  DialogueNodeStatement,

  CallExpression,
  AssignmentExpression,
  ChoiceExpression,

  BinaryExpression,
  UnaryExpression,
  IdentifierExpression,
  LiteralExpression,
}

//#region Node interfaces

export interface ProgramNode {
  type: NodeType.Program;
  body: StatementNode[];
}

export interface BlockStatementNode {
  type: NodeType.BlockStatement;
  block: StatementNode[];
}

export interface VariableStatementNode {
  type: NodeType.VariableStatement;
  name: string;
  value: ExpressionNode | null;
}

export interface ConstantStatementNode {
  type: NodeType;
  name: string;
  value: ExpressionNode;
}

export interface IfStatementNode {
  type: NodeType.IfStatement;
  test: ExpressionNode;
  consequent: StatementNode;
  alternate: StatementNode | null;
}

export interface ReturnStatementNode {
  type: NodeType.ReturnStatement;
  value: ExpressionNode;
}

export interface OnEventStatementNode {
  type: NodeType.OnEventStatement;
  eventName: string;
  body: StatementNode;
}

export interface DefinitionStatementNode {
  type: NodeType.DefinitionStatement;
  defType: 'NPC' | 'LOCATION' | 'REGION' | 'ITEM' | 'MONSTER';
  id: string;
  body: StatementNode[];
}

export interface DialogueRoute {
  isDefault: boolean;
  condition: ExpressionNode | null;
  targetNodeId: string;
}

export interface DialogueTreeStatementNode {
  type: NodeType.DialogueTreeStatement;
  treeId: string;
  targetNpcId: string; 
  routes: DialogueRoute[]; // <-- Added routing configuration bucket
  nodes: DialogueNodeStatementNode[];
}

export interface DialogueNodeStatementNode {
  type: NodeType.DialogueNodeStatement;
  nodeId: string;
  text: string;
  choices: ChoiceExpressionNode[];
  onExecute: StatementNode | null;
}

export interface CallExpressionNode {
  type: NodeType.CallExpression;
  funcName: string;
  arguments: ExpressionNode[];
}

export interface AssignmentExpressionNode {
  type: NodeType.AssignmentExpression;
  identifier: string;
  expression: ExpressionNode;
}

export interface BinaryExpressionNode {
  type: NodeType.BinaryExpression;
  left: ExpressionNode
  operator: string;
  right: ExpressionNode
}

export interface ChoiceExpressionNode {
  type: NodeType.ChoiceExpression;
  text: string;                      // The text rendered on the button (e.g., "Yes")
  targetNodeId: string;              // The ID of the node to jump to (e.g., "ACCEPTED")
  condition: ExpressionNode | null;  // Optional: For conditional choices like IF HAS_ITEM("KEY")
}

export interface UnaryExpressionNode {
  type: NodeType.UnaryExpression
  operator: string
  argument: ExpressionNode
}

export interface IdentifierExpressionNode {
  type: NodeType.IdentifierExpression;
  name: string;
}

export interface LiteralExpressionNode {
  type: NodeType.LiteralExpression;
  value: string | number;
}

//#endregion

export type StatementNode = BlockStatementNode | VariableStatementNode | ConstantStatementNode | IfStatementNode | ReturnStatementNode | OnEventStatementNode | CallExpressionNode | AssignmentExpressionNode | DefinitionStatementNode | DialogueTreeStatementNode | DialogueNodeStatementNode;
export type ExpressionNode = CallExpressionNode | AssignmentExpressionNode | BinaryExpressionNode | UnaryExpressionNode | IdentifierExpressionNode | LiteralExpressionNode | ChoiceExpressionNode;

export type Node = ProgramNode | StatementNode | ExpressionNode;

export interface ParsingContext {
  tokens: Token[];
  constants: Set<string>;
  variables: Set<string>;
}

export interface Nodes {
  [NodeType.Program]: ProgramNode;

  [NodeType.VariableStatement]: VariableStatementNode;
  [NodeType.BlockStatement]: BlockStatementNode;
  [NodeType.ConstantStatement]: ConstantStatementNode;
  [NodeType.IfStatement]: IfStatementNode;
  [NodeType.OnEventStatement]: OnEventStatementNode;
  [NodeType.DefinitionStatement]: DefinitionStatementNode;
  [NodeType.DialogueTreeStatement]: DialogueTreeStatementNode,
  [NodeType.DialogueNodeStatement]: DialogueNodeStatementNode,

  [NodeType.CallExpression]: CallExpressionNode;
  [NodeType.AssignmentExpression]: AssignmentExpressionNode;
  [NodeType.BinaryExpression]: BinaryExpressionNode;
  [NodeType.UnaryExpression]: UnaryExpressionNode;
  [NodeType.ChoiceExpression]: ChoiceExpressionNode;

  [NodeType.ReturnStatement]: ReturnStatementNode;
  [NodeType.IdentifierExpression]: IdentifierExpressionNode;
  [NodeType.LiteralExpression]: LiteralExpressionNode;
}

export type NodeGenerators = {
  [K in NodeType]: (node: Nodes[K], indent: string) => string;
};