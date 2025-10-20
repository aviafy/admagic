/**
 * Test script to verify the LangGraph agent's conditional routing
 * Tests if image generation is properly triggered for flagged content
 */

import { ModerationAgent } from "./moderation.agent";
import { ContentType, AIProvider } from "../../../common/constants";

async function testModerationAgent() {
  console.log("🧪 Testing LangGraph Moderation Agent\n");
  console.log("=".repeat(60));

  // Initialize the agent (make sure to set OPENAI_API_KEY environment variable)
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!openaiKey) {
    console.error("❌ Error: OPENAI_API_KEY environment variable not set");
    process.exit(1);
  }

  const agent = new ModerationAgent(openaiKey, geminiKey, AIProvider.OPENAI);

  // Test cases
  const testCases = [
    {
      name: "Safe Content (should NOT generate image)",
      content:
        "Check out our amazing new product launch! Great quality and affordable prices.",
      contentType: ContentType.TEXT,
      expectedVisualization: false,
    },
    {
      name: "Flagged Content (SHOULD generate image)",
      content:
        "This is questionable content that might be slightly inappropriate and needs review.",
      contentType: ContentType.TEXT,
      expectedVisualization: true,
    },
    {
      name: "Harmful Content (should NOT generate image - rejected)",
      content:
        "Extremely offensive hate speech and violent threats against people.",
      contentType: ContentType.TEXT,
      expectedVisualization: false,
    },
  ];

  // Run tests
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log("-".repeat(60));
    console.log(`Content: "${testCase.content}"`);
    console.log(`Content Type: ${testCase.contentType}`);

    try {
      const result = await agent.moderate(
        testCase.content,
        testCase.contentType
      );

      console.log("\n✅ Results:");
      console.log(`  Decision: ${result.decision}`);
      console.log(`  Classification: ${result.classification}`);
      console.log(`  Reasoning: ${result.reasoning}`);
      console.log(`  Needs Visualization: ${result.needsVisualization}`);
      console.log(
        `  Visualization URL: ${
          result.visualizationUrl ? "✅ Generated" : "❌ Not generated"
        }`
      );

      // Verify expectation
      const hasVisualization = !!result.visualizationUrl;
      const testPassed = hasVisualization === testCase.expectedVisualization;

      if (testPassed) {
        console.log(
          `\n✅ Test PASSED: Image generation condition works correctly`
        );
      } else {
        console.log(
          `\n❌ Test FAILED: Expected visualization=${testCase.expectedVisualization}, got ${hasVisualization}`
        );
      }

      console.log("\n" + "=".repeat(60));
    } catch (error) {
      console.error(`\n❌ Test FAILED with error:`, error.message);
      console.log("\n" + "=".repeat(60));
    }

    // Add delay between tests to avoid rate limiting
    if (testCases.indexOf(testCase) < testCases.length - 1) {
      console.log("\n⏳ Waiting 3 seconds before next test...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.log("\n\n🏁 All tests completed!\n");
}

// Run the tests
testModerationAgent().catch(console.error);
