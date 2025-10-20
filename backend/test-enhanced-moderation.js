#!/usr/bin/env node

/**
 * Test script for enhanced content moderation
 * Tests detection of +18 content and violence
 */

const API_BASE_URL = "http://localhost:3001/api";

// Test cases
const testCases = [
  {
    name: "✅ Safe Content - Family Friendly",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText:
        "Beautiful sunset at the beach today! Family had a great time.",
    },
    expected: "APPROVED",
  },
  {
    name: "❌ Adult Content - Explicit",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText: "Check out this sexy nude photo of...",
    },
    expected: "REJECTED",
    expectedConcern: "Adult/Explicit Content",
  },
  {
    name: "❌ Violence - Graphic",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText:
        "Graphic video of someone being violently attacked with blood everywhere",
    },
    expected: "REJECTED",
    expectedConcern: "Violence",
  },
  {
    name: "⚠️ Borderline - May Be Flagged",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText: "This political statement might be controversial...",
    },
    expected: "FLAGGED or APPROVED",
  },
  {
    name: "❌ Adult Content - Dating Service",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText:
        "Adult dating service, find singles in your area for hookups",
    },
    expected: "REJECTED or FLAGGED",
    expectedConcern: "Adult/Explicit Content",
  },
  {
    name: "❌ Violence - Weapons",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText: "Going to shoot up the place with my new gun",
    },
    expected: "REJECTED",
    expectedConcern: "Violence",
  },
  {
    name: "❌ Self-Harm Content",
    data: {
      userId: "test-user-1",
      contentType: "text",
      contentText: "Instructions on how to harm yourself",
    },
    expected: "REJECTED",
    expectedConcern: "Violence",
  },
];

// Colors for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

async function submitContent(data) {
  const response = await fetch(`${API_BASE_URL}/content/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function getSubmissionStatus(submissionId) {
  const response = await fetch(
    `${API_BASE_URL}/content/status/${submissionId}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }

  return response.json();
}

async function waitForModeration(submissionId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getSubmissionStatus(submissionId);

    if (status.status !== "pending") {
      return status;
    }

    // Wait 1 second before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.stdout.write(".");
  }

  throw new Error("Moderation timeout");
}

async function runTest(testCase) {
  console.log(
    `\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}Test:${colors.reset} ${testCase.name}`);
  console.log(
    `${colors.gray}Content:${
      colors.reset
    } "${testCase.data.contentText?.substring(0, 60)}..."`
  );
  console.log(`${colors.gray}Expected:${colors.reset} ${testCase.expected}`);

  try {
    // Submit content
    const submission = await submitContent(testCase.data);
    console.log(
      `\n${colors.gray}Submission ID:${colors.reset} ${submission.submissionId}`
    );
    process.stdout.write(`${colors.gray}Waiting for moderation${colors.reset}`);

    // Wait for moderation to complete
    const result = await waitForModeration(submission.submissionId);

    console.log("\n");

    // Display results
    const decision = result.aiDecision?.decision?.toUpperCase();
    const status = result.status.toUpperCase();

    let statusColor = colors.green;
    if (status === "REJECTED") statusColor = colors.red;
    else if (status === "FLAGGED") statusColor = colors.yellow;

    console.log(
      `${colors.blue}Status:${colors.reset} ${statusColor}${status}${colors.reset}`
    );
    console.log(
      `${colors.blue}Decision:${colors.reset} ${statusColor}${decision}${colors.reset}`
    );

    if (result.aiDecision?.reasoning) {
      console.log(`\n${colors.blue}AI Reasoning:${colors.reset}`);
      console.log(
        `${colors.gray}${result.aiDecision.reasoning}${colors.reset}`
      );
    }

    if (result.aiDecision?.analysisResult?.concerns?.length > 0) {
      console.log(`\n${colors.blue}Concerns Detected:${colors.reset}`);
      result.aiDecision.analysisResult.concerns.forEach((concern) => {
        console.log(`  ${colors.red}• ${concern}${colors.reset}`);
      });
    }

    if (result.aiDecision?.analysisResult?.severity) {
      console.log(
        `\n${colors.blue}Severity:${
          colors.reset
        } ${result.aiDecision.analysisResult.severity.toUpperCase()}`
      );
    }

    // Check if result matches expectation
    const expectedDecisions = testCase.expected
      .split(" or ")
      .map((d) => d.trim());
    const matchesExpectation = expectedDecisions.includes(decision);

    if (matchesExpectation) {
      console.log(`\n${colors.green}✓ Test PASSED${colors.reset}`);
    } else {
      console.log(
        `\n${colors.red}✗ Test WARNING - Expected ${testCase.expected}, got ${decision}${colors.reset}`
      );
    }

    // Check for expected concern
    if (
      testCase.expectedConcern &&
      result.aiDecision?.analysisResult?.concerns
    ) {
      const hasConcern = result.aiDecision.analysisResult.concerns.some((c) =>
        c.includes(testCase.expectedConcern)
      );
      if (hasConcern) {
        console.log(
          `${colors.green}✓ Expected concern "${testCase.expectedConcern}" detected${colors.reset}`
        );
      } else {
        console.log(
          `${colors.yellow}⚠ Expected concern "${testCase.expectedConcern}" not found${colors.reset}`
        );
      }
    }

    return { success: matchesExpectation, result };
  } catch (error) {
    console.log(`\n${colors.red}✗ Test FAILED${colors.reset}`);
    console.log(`${colors.red}Error: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log(
    `${colors.cyan}╔════════════════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.cyan}║  Enhanced Content Moderation System - Test Suite      ║${colors.reset}`
  );
  console.log(
    `${colors.cyan}║  Testing +18 Content & Violence Detection             ║${colors.reset}`
  );
  console.log(
    `${colors.cyan}╚════════════════════════════════════════════════════════╝${colors.reset}`
  );

  console.log(`\n${colors.gray}API URL: ${API_BASE_URL}${colors.reset}`);
  console.log(
    `${colors.gray}Total Tests: ${testCases.length}${colors.reset}\n`
  );

  // Check if server is running
  try {
    await fetch(API_BASE_URL);
  } catch (error) {
    console.log(
      `${colors.red}ERROR: Cannot connect to API server at ${API_BASE_URL}${colors.reset}`
    );
    console.log(
      `${colors.yellow}Please start the backend server first:${colors.reset}`
    );
    console.log(
      `${colors.gray}  cd backend && npm run start:dev${colors.reset}\n`
    );
    process.exit(1);
  }

  const results = [];

  // Run all tests
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
  }

  // Summary
  console.log(
    `\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );
  console.log(`${colors.blue}Test Summary${colors.reset}`);
  console.log(
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  );

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed/Warning: ${failed}${colors.reset}`);
  console.log(`Total: ${results.length}\n`);

  if (passed === results.length) {
    console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Some tests need review${colors.reset}\n`);
  }
}

// Run tests
main().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
