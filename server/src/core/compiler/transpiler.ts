import { generateCode } from "./generator";
import { parseTokens } from "./parser";
import { tokenize } from "./tokenizer";

export function transpile(code: string): string {
  const tokens = tokenize(code);
  const ast = parseTokens(tokens);

  return generateCode(ast);
};
