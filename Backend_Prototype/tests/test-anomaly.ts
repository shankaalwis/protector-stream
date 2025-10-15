/**
 * Anomaly Alert Function Test Script
 * Tests the anomaly-alert Edge Function
 * 
 * Usage: deno run --allow-net --allow-env test-anomaly.ts
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/anomaly-alert`;

console.log("🧪 Testing Anomaly Alert Function\n");
console.log(`📍 Function URL: ${FUNCTION_URL}\n`);

const testCases = [
  {
    name: "Valid anomaly alert",
    data: {
      timestamp: new Date().toISOString(),
      client_id: "mqtt-test-device",
      packet_count: 1500,
      anomaly_score: 0.85,
      is_anomaly: true,
    },
    expectedStatus: 200,
  },
  {
    name: "Normal traffic (non-anomaly)",
    data: {
      timestamp: new Date().toISOString(),
      client_id: "mqtt-test-device",
      packet_count: 100,
      anomaly_score: 0.15,
      is_anomaly: false,
    },
    expectedStatus: 200,
  },
  {
    name: "Missing required field",
    data: {
      timestamp: new Date().toISOString(),
      client_id: "mqtt-test-device",
      // Missing packet_count
      anomaly_score: 0.85,
      is_anomaly: true,
    },
    expectedStatus: 400,
  },
  {
    name: "Invalid data type",
    data: {
      timestamp: new Date().toISOString(),
      client_id: "mqtt-test-device",
      packet_count: "not a number", // Should be number
      anomaly_score: 0.85,
      is_anomaly: true,
    },
    expectedStatus: 400,
  },
];

async function runTest(testCase: any, index: number) {
  console.log(`\nTest ${index + 1}: ${testCase.name}`);
  console.log(`📤 Payload:`, JSON.stringify(testCase.data, null, 2));

  try {
    const response = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testCase.data),
    });

    const result = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📄 Response:`, result);

    if (response.status === testCase.expectedStatus) {
      console.log(`✅ Test passed! (Expected ${testCase.expectedStatus})`);
      return true;
    } else {
      console.log(
        `❌ Test failed! Expected ${testCase.expectedStatus}, got ${response.status}`
      );
      return false;
    }
  } catch (error) {
    console.error(`❌ Test failed with error:`, error);
    return false;
  }
}

async function runAllTests() {
  let passed = 0;
  let failed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const success = await runTest(testCases[i], i);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log("\n\n🎉 All tests completed!");
  console.log("\n📊 Test Summary:");
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📝 Total: ${testCases.length}`);

  if (failed > 0) {
    Deno.exit(1);
  }
}

runAllTests();
