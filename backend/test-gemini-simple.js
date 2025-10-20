// Simple test to verify Gemini integration
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
  console.log("🧪 Testing Gemini Integration\n");

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: GEMINI_API_KEY environment variable not set");
    console.log("\nTo fix this:");
    console.log(
      "1. Get API key from: https://makersuite.google.com/app/apikey"
    );
    console.log('2. Run: export GEMINI_API_KEY="your-api-key"');
    console.log("3. Run this test again\n");
    process.exit(1);
  }

  try {
    console.log("Initializing Gemini...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Sending test prompt...");
    const result = await model.generateContent(
      "Say hello and confirm you are working!"
    );
    const response = await result.response;
    const text = response.text();

    console.log("\n✅ SUCCESS! Gemini is working!\n");
    console.log("Response from Gemini:");
    console.log("─".repeat(60));
    console.log(text);
    console.log("─".repeat(60));
    console.log("\n🎉 Your Gemini integration is ready to use!\n");
  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to Gemini");
    console.error("Error details:", error.message);
    console.log("\nPossible issues:");
    console.log("- Invalid API key");
    console.log("- Network connection problems");
    console.log("- API quota exceeded\n");
    process.exit(1);
  }
}

testGemini();
