import { tokenize } from '@/subsystems/compiler/tokenizer';
import { parseTokens } from '@/subsystems/compiler/parser';

import fs from 'fs/promises';
import path from 'path';

async function loadWorldFile(filename: string = 'alefgard.dw'): Promise<string> {
  try {
    // Safely resolve the path from the root data directory
    const filePath = path.join(process.cwd(), 'data', filename);

    // Read the file. Specifying 'utf8' returns a string instead of a raw binary Buffer
    const fileContent = await fs.readFile(filePath, 'utf8');

    return fileContent;
  } catch (error: any) {
    console.error(`Error reading file ${filename}:`, error.message);
    throw error;
  }
}

// Example usage:
async function init() {
  const sampleScript = await loadWorldFile('alefgard.dw');
  console.log("Loaded script content successfully!");
  runParserTest(sampleScript);

  // You can now pass rawScript straight into your transpile(rawScript) function
}

init();

function runParserTest(sampleScript: string) {
  console.log("=========================================");
  console.log("STAGE 1: Running Tokenizer...");
  console.log("=========================================");

  let tokens;
  try {
    tokens = tokenize(sampleScript);
    console.log(`Successfully generated ${tokens.length} tokens.\n`);
    // Print the first few tokens as a sanity check
    console.log("First 5 Tokens sample:", tokens.slice(0, 5));
  } catch (error: any) {
    console.error("❌ Tokenizer Failed!");
    console.error(error.message);
    return;
  }

  console.log("\n=========================================");
  console.log("STAGE 2: Running Parser...");
  console.log("=========================================");

  try {
    const ast = parseTokens(tokens);
    console.log("✅ Parser Success! Complete Abstract Syntax Tree (AST):");
    console.log(JSON.stringify(ast, null, 2));
  } catch (error: any) {
    console.error("❌ Parser Failed!");
    console.error(error.message);
    console.log("\nRemaining unparsed tokens at crash site:");
    console.log(tokens.slice(0, 3)); // Shows exactly what it got stuck on
  }
}
