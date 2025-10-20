#!/bin/bash

# Test script to verify the LangGraph moderation agent's conditional routing

echo "🧪 Testing LangGraph Moderation Agent Flow"
echo "=========================================="
echo ""

# Check if OPENAI_API_KEY is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable not set"
    echo "Please set it with: export OPENAI_API_KEY='your-api-key'"
    exit 1
fi

echo "✅ OPENAI_API_KEY is set"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend"

echo "📦 Installing dependencies (if needed)..."
npm install --silent

echo ""
echo "🚀 Running moderation agent test..."
echo ""

# Run the test script
npx ts-node src/modules/moderation/agents/test-agent.ts

echo ""
echo "✅ Test completed!"

