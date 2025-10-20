#!/bin/bash

# Test Image Generation Determination Feature
# This script tests the conditional DALL-E 3 image generation

echo "🧪 Image Generation Determination Test"
echo "======================================="
echo ""

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo ""
    echo "Please set it with:"
    echo "  export OPENAI_API_KEY='your-api-key-here'"
    echo ""
    exit 1
fi

echo "✅ OpenAI API key found"
echo ""

# Build the project if needed
if [ ! -d "dist" ]; then
    echo "📦 Building project..."
    npm run build
    echo ""
fi

# Run the test
echo "🚀 Running image generation tests..."
echo ""
node test-image-generation.js

# Capture exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ All tests passed! Image generation determination is working correctly."
else
    echo "❌ Some tests failed. Please review the output above."
fi

exit $TEST_EXIT_CODE

