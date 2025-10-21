"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moderation_agent_1 = require("../src/modules/moderation/agents/moderation.agent");
const constants_1 = require("../src/common/constants");
async function testModerationAgent() {
    console.log("🧪 Testing LangGraph Moderation Agent\n");
    console.log("=".repeat(60));
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!openaiKey) {
        console.error("❌ Error: OPENAI_API_KEY environment variable not set");
        process.exit(1);
    }
    const agent = new moderation_agent_1.ModerationAgent(openaiKey, geminiKey, constants_1.AIProvider.OPENAI);
    const testCases = [
        {
            name: "Safe Content (should NOT generate image)",
            content: "Check out our amazing new product launch! Great quality and affordable prices.",
            contentType: constants_1.ContentType.TEXT,
            expectedVisualization: false,
        },
        {
            name: "Flagged Content (SHOULD generate image)",
            content: "This is questionable content that might be slightly inappropriate and needs review.",
            contentType: constants_1.ContentType.TEXT,
            expectedVisualization: true,
        },
        {
            name: "Harmful Content (should NOT generate image - rejected)",
            content: "Extremely offensive hate speech and violent threats against people.",
            contentType: constants_1.ContentType.TEXT,
            expectedVisualization: false,
        },
    ];
    for (const testCase of testCases) {
        console.log(`\n📋 Test: ${testCase.name}`);
        console.log("-".repeat(60));
        console.log(`Content: "${testCase.content}"`);
        console.log(`Content Type: ${testCase.contentType}`);
        try {
            const result = await agent.moderate(testCase.content, testCase.contentType);
            console.log("\n✅ Results:");
            console.log(`  Decision: ${result.decision}`);
            console.log(`  Classification: ${result.classification}`);
            console.log(`  Reasoning: ${result.reasoning}`);
            console.log(`  Needs Visualization: ${result.needsVisualization}`);
            console.log(`  Visualization URL: ${result.visualizationUrl ? "✅ Generated" : "❌ Not generated"}`);
            const hasVisualization = !!result.visualizationUrl;
            const testPassed = hasVisualization === testCase.expectedVisualization;
            if (testPassed) {
                console.log(`\n✅ Test PASSED: Image generation condition works correctly`);
            }
            else {
                console.log(`\n❌ Test FAILED: Expected visualization=${testCase.expectedVisualization}, got ${hasVisualization}`);
            }
            console.log("\n" + "=".repeat(60));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`\n❌ Test FAILED with error:`, errorMessage);
            console.log("\n" + "=".repeat(60));
        }
        if (testCases.indexOf(testCase) < testCases.length - 1) {
            console.log("\n⏳ Waiting 3 seconds before next test...");
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
    console.log("\n\n🏁 All tests completed!\n");
}
testModerationAgent().catch(console.error);
//# sourceMappingURL=test-agent.js.map