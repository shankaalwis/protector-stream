/**
 * Metrics Ingest Function Test Script
 * Tests the metrics-ingest Edge Function
 * 
 * Usage: deno run --allow-net --allow-env test-metrics.ts
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/metrics-ingest`;

console.log("🧪 Testing Metrics Ingest Function\n");
console.log(`📍 Function URL: ${FUNCTION_URL}\n`);

const testCases = [
  {
    name: "Top Targeted Clients Metric",
    data: {
      metric_key: "top_targeted_clients",
      data: [
        { targeted_client: "mqtt-device-001", failure_count: "150" },
        { targeted_client: "mqtt-device-002", failure_count: "75" },
      ],
      timestamp: Date.now(),
    },
  },
  {
    name: "Top Busiest Topics Metric",
    data: {
      metric_key: "top_busiest_topics",
      data: [
        { topic_name: "home/temperature", message_count: "5000" },
        { topic_name: "home/humidity", message_count: "3200" },
      ],
      timestamp: Date.now(),
    },
  },
  {
    name: "Failed Auth Attempts (Splunk format)",
    data: {
      search_name: "Failed Auth Attempts (24h) Webhook",
      result: {
        time: Math.floor(Date.now() / 1000).toString(),
        total_failed_attempts: "245",
      },
    },
  },
  {
    name: "Successful Connections (Splunk format)",
    data: {
      search_name: "successful_connections_24h",
      result: {
        time: Math.floor(Date.now() / 1000).toString(),
        successful_connections: "1850",
      },
    },
  },
  {
    name: "Message Throughput (Rolling)",
    data: {
      search_name: "Dashboard Data: Message Throughput (New)",
      result: {
        time: Math.floor(Date.now() / 1000).toString(),
        value: "25",
      },
    },
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

    if (response.ok) {
      console.log(`✅ Metric stored successfully!`);
      return true;
    } else {
      console.log(`❌ Failed to store metric`);
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
    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n\n🎉 All tests completed!");
  console.log("\n📊 Test Summary:");
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📝 Total: ${testCases.length}`);
  console.log("\n📝 Note: Rolling metrics maintain last 60 data points");

  if (failed > 0) {
    Deno.exit(1);
  }
}

runAllTests();
