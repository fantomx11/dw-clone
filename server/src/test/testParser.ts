import { tokenize } from '@/core/compiler/tokenizer';
import { parseTokens } from '@/core/compiler/parser';

const sampleScript = `
SET_CURRENT_REGION("tantegel_surroundings")
SET_CURRENT_LOCATION("tantegel_castle")
SET_CURRENT_SUBNODE("throne_room")

START REGION tantegel_surroundings
  NAME "Tantegel Surroundings"
  START MONSTERS
    slime
    red_slime
    drakee
  END MONSTERS
  REVEAL_CHANCE 0.35
  ENCOUNTER_CHANCE 0.45
  NO_EVENT_CHANCE 0.20
END REGION

START LOCATION tantegel_castle
  REGION tantegel_surroundings
  NAME "Tantegel Castle"
  DISCOVERED TRUE
  BACKGROUND "assets/bg/tantegel_exterior.png"
  STARTING_SUBNODE outdoor_castle

  START SUBNODE throne_room
    NAME "King Lorik's Throne Room"
    BACKGROUND "assets/bg/throne_room.png"
    START CONNECTIONS 
      castle_courtyard
    END CONNECTIONS
    START NPCS
      king_lorik
    END NPCS
  END SUBNODE
END LOCATION

START NPC king_lorik
  NAME "King Lorik"
  IMAGE "assets/npc/king_lorik.png"
END NPC

DIALOGUE_TREE king_lorik
  ROUTE IF NOT GET_FLAG("talked_to_king") THEN GOTO king_greeting
  ROUTE IF GET_FLAG("princess_rescued") THEN GOTO king_reward
  ROUTE DEFAULT GOTO king_waiting

  NODE king_greeting
    TEXT "Descendant of Erdrick! The vile Dragonlord has stolen the Ball of Light and seized Princess Gwaelin. Will you take up your ancestral sword to rescue them?"
    
    ON_EXECUTE BLOCK
      SET_FLAG("talked_to_king", TRUE)
    END BLOCK

    CHOICE "Yes, Your Majesty." THEN GOTO king_accept
    CHOICE "No, it is too dangerous." THEN GOTO king_refuse
  END NODE
END DIALOGUE_TREE
`;

function runParserTest() {
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

runParserTest();