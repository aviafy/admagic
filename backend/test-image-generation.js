/**
 * Test Image Generation Determination
 *
 * This script tests the conditional image generation feature:
 * - Safe content → NO image generated
 * - Flagged content → YES image generated (DALL-E 3)
 * - Harmful content → NO image generated
 */

const {
  ModerationAgent,
} = require("./dist/modules/moderation/agents/moderation.agent");
const { ContentType, ModerationDecision } = require("./dist/common/constants");

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  console.log("\n" + "=".repeat(70));
  log(message, colors.bright + colors.cyan);
  console.log("=".repeat(70) + "\n");
}

function logTest(testName) {
  log(`\n📋 Test: ${testName}`, colors.bright + colors.blue);
  console.log("-".repeat(70));
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.cyan);
}

async function testImageGeneration() {
  logHeader("🧪 Testing Image Generation Determination");

  // Check for API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    logError("OPENAI_API_KEY not found in environment variables");
    logInfo('Please set it with: export OPENAI_API_KEY="your-key-here"');
    process.exit(1);
  }

  logSuccess("OpenAI API key found");

  // Initialize agent
  const agent = new ModerationAgent(apiKey);
  logSuccess("Moderation agent initialized\n");

  // Test cases
  const testCases = [
    {
      name: "Safe Content (should NOT generate image)",
      content:
        "Check out this amazing new product launch! It looks great and I am excited to share it with you all.",
      expectedDecision: ModerationDecision.APPROVED,
      shouldGenerateImage: false,
    },
    {
      name: "Borderline/Flagged Content (SHOULD generate image)",
      content:
        "This content might be questionable and needs human review. It contains some potentially concerning language.",
      expectedDecision: ModerationDecision.FLAGGED,
      shouldGenerateImage: true,
    },
    {
      name: "Harmful Content (should NOT generate image)",
      content:
        "This is extremely offensive hate speech targeting specific groups with threats and harassment.",
      expectedDecision: ModerationDecision.REJECTED,
      shouldGenerateImage: false,
    },
  ];

  let passedTests = 0;
  let failedTests = 0;

  for (const testCase of testCases) {
    logTest(testCase.name);

    logInfo(`Content: "${testCase.content}"`);
    logInfo(`Content Type: text`);
    logInfo(
      `Expected to generate image: ${
        testCase.shouldGenerateImage ? "YES" : "NO"
      }\n`
    );

    try {
      // Run moderation
      const startTime = Date.now();
      const result = await agent.moderate(testCase.content, ContentType.TEXT);
      const duration = Date.now() - startTime;

      // Display results
      log(`⏱️  Moderation Time: ${duration}ms`, colors.cyan);

      logInfo("Results:");
      console.log(`  Decision: ${result.decision}`);
      console.log(`  Classification: ${result.classification || "N/A"}`);
      console.log(`  Reasoning: ${result.reasoning || "N/A"}`);
      console.log(`  Needs Visualization: ${result.needsVisualization}`);
      console.log(
        `  Visualization URL: ${
          result.visualizationUrl ? "✅ Generated" : "❌ Not generated"
        }`
      );

      // Validate results
      const imageGenerated = !!result.visualizationUrl;
      const imageGenerationMatches =
        imageGenerated === testCase.shouldGenerateImage;

      console.log("\n" + "─".repeat(70));

      if (imageGenerationMatches) {
        if (testCase.shouldGenerateImage && result.visualizationUrl) {
          logSuccess("✅ TEST PASSED: Image was generated as expected");
          logSuccess(
            `   Image URL: ${result.visualizationUrl.substring(0, 60)}...`
          );
        } else {
          logSuccess("✅ TEST PASSED: Image was NOT generated as expected");
        }
        passedTests++;
      } else {
        logError("❌ TEST FAILED: Image generation did not match expectation");
        logError(`   Expected image: ${testCase.shouldGenerateImage}`);
        logError(`   Got image: ${imageGenerated}`);
        failedTests++;
      }

      // Additional validations
      if (result.needsVisualization !== testCase.shouldGenerateImage) {
        logWarning(
          `⚠️  needsVisualization flag (${result.needsVisualization}) doesn't match expectation`
        );
      }

      if (
        testCase.shouldGenerateImage &&
        result.needsVisualization &&
        !result.visualizationUrl
      ) {
        logError(
          "❌ CRITICAL: needsVisualization was true but no image was generated!"
        );
        logError("   This indicates a failure in the DALL-E API call");
      }
    } catch (error) {
      logError(`❌ TEST ERROR: ${error.message}`);
      console.error(error);
      failedTests++;
    }
  }

  // Summary
  logHeader("🏁 Test Summary");

  console.log(`Total Tests: ${testCases.length}`);
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  } else {
    logSuccess(`Failed: ${failedTests}`);
  }

  const successRate = ((passedTests / testCases.length) * 100).toFixed(1);
  console.log(`\nSuccess Rate: ${successRate}%\n`);

  if (failedTests === 0) {
    logHeader("✅ ALL TESTS PASSED! Image Generation Works Correctly! 🎉");

    logInfo("The conditional image generation is working as expected:");
    console.log("  ✅ Safe content → No image");
    console.log("  ✅ Flagged content → Image generated via DALL-E 3");
    console.log("  ✅ Harmful content → No image\n");
  } else {
    logHeader("❌ SOME TESTS FAILED");
    logWarning("Please review the errors above and check:");
    console.log("  1. OpenAI API key is valid");
    console.log("  2. DALL-E 3 access is enabled on your account");
    console.log("  3. Network connectivity to OpenAI");
    console.log("  4. API rate limits not exceeded\n");
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
testImageGeneration().catch((error) => {
  logError("Fatal error running tests:");
  console.error(error);
  process.exit(1);
});
