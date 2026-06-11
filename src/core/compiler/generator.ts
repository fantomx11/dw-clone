import { allowedGlobals, allowedFunctions } from "./tokenizer";
import { Node, NodeGenerators, NodeType, ProgramNode, VariableStatementNode, BlockStatementNode, ConstantStatementNode, ReturnStatementNode, AssignmentExpressionNode, IdentifierExpressionNode, LiteralExpressionNode, IfStatementNode, OnEventStatementNode, CallExpressionNode, BinaryExpressionNode, UnaryExpressionNode, DefinitionStatementNode, ChoiceExpressionNode, DialogueNodeStatementNode, DialogueTreeStatementNode } from "./types";

export const generators: NodeGenerators = {
  [NodeType.Program]: (node: ProgramNode, indent: string): string => node.body.map(n => generateCode(n, indent)).join('\n'),
  [NodeType.VariableStatement]: (node: VariableStatementNode, indent: string): string => `${indent}let ${node.name}${node.value ? ` = ${generateCode(node.value, indent)}` : ''};`,
  [NodeType.BlockStatement]: (node: BlockStatementNode, indent: string): string => `${indent}{\n${node.block.map(node => generateCode(node, indent + '  ')).join(`\n`)}\n${indent}}`,
  [NodeType.ConstantStatement]: (node: ConstantStatementNode, indent: string): string => `${indent}const ${node.name} = ${generateCode(node.value, indent)};`,
  [NodeType.ReturnStatement]: (node: ReturnStatementNode, indent: string): string => `${indent}return ${generateCode((node).value, indent)};`,
  [NodeType.AssignmentExpression]: (node: AssignmentExpressionNode, indent: string): string => `${indent}${(node).identifier} = ${generateCode((node).expression, indent)};`,
  [NodeType.IdentifierExpression]: (node: IdentifierExpressionNode, indent: string): string => allowedGlobals.has(node.name) ? allowedGlobals.get(node.name)! : node.name,
  [NodeType.LiteralExpression]: (node: LiteralExpressionNode, indent: string): string => typeof node.value === "string" ? (allowedGlobals.has(node.value) ? allowedGlobals.get(node.value)! : `"${node.value}"`) : node.value.toString(),

  [NodeType.IfStatement]: function (node: IfStatementNode, indent: string): string {
    const consequent = `${generateCode(node.consequent, indent + '  ')}\n${indent}`;
    const alternate = node.alternate ? ` else ${generateCode(node.alternate, indent + '  ')}\n${indent}}` : '';
    return `${indent}if (${generateCode(node.test, indent)}) ${consequent}${alternate}`;
  },
  [NodeType.OnEventStatement]: function (node: OnEventStatementNode, indent: string): string {
    const eventName = node.eventName;
    const eventBody = generateCode(node.body, indent + '  ');
    return `${indent}registerEvent(${eventName}, (player) => ${eventBody});`;
  },
  [NodeType.DefinitionStatement]: function (node: DefinitionStatementNode, indent: string): string {
    // Compiles block statements into an immediately invoked execution scope or a builder pattern
    const bodyCode = node.body.map(n => generateCode(n, indent + '  ')).join('\n');

    return `${indent}world.register('${node.defType}', '${node.id}', () => {\n${bodyCode}\n${indent}});`;
  },

  [NodeType.DialogueTreeStatement]: function (node: DialogueTreeStatementNode, indent: string): string {
    // TODO: Transpile dialogue trees to world registry hooks
    return `${indent}// Dialogue Tree: ${node.treeId}`;
  },

  [NodeType.DialogueNodeStatement]: function (node: DialogueNodeStatementNode, indent: string): string {
    // TODO: Transpile individual structural narrative steps
    return `${indent}// Node: ${node.nodeId}`;
  },

  [NodeType.ChoiceExpression]: function (node: ChoiceExpressionNode, indent: string): string {
    // TODO: Transpile decision routing expressions
    return `${indent}// Choice: ${node.text}`;
  },

  [NodeType.CallExpression]: function (node: CallExpressionNode, indent: string): string {
    const funcName = allowedFunctions[node.funcName].alias;
    const args = node.arguments.map(arg => generateCode(arg, indent));

    return `${indent}${funcName}(${args.join(', ')})`;
  },
  [NodeType.BinaryExpression]: function (node: BinaryExpressionNode, indent: string): string {
    let op = node.operator;
    if (op === 'AND') op = '&&';
    if (op === 'OR') op = '||';
    const leftExp = generateCode(node.left, indent);
    const rightExp = generateCode(node.right, indent);
    return `${leftExp} ${op} ${rightExp}`;
  },
  [NodeType.UnaryExpression]: function (node: UnaryExpressionNode, indent: string): string {
    let op_unary = node.operator;
    if (op_unary === 'NOT') op_unary = '!';
    const argExp = generateCode(node.argument, indent);
    return `${op_unary}${argExp}`;
  },
}

export function generateCode(node: Node, indent = ''): string {
  const generator = generators[node.type];
  if (generator === void 0) throw new Error(`Unknown node type: ${node.type}`);
  return generator(<any>node, indent);
}