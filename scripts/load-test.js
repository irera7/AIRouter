#!/usr/bin/env node

/**
 * Load Testing Script
 * Simple load test using concurrent requests
 */

const API_KEY = process.env.API_KEY || 'sk-air-aqBzZhZWzqRfz6sIsu7GmMa5u4JzA3PA';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENT_USERS = parseInt(process.env.USERS) || 10;
const REQUESTS_PER_USER = parseInt(process.env.REQUESTS) || 10;

const stats = {
  total: 0,
  success: 0,
  failed: 0,
  durations: [],
};

async function makeRequest() {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Hello, this is a load test!' }
        ],
        preferredProvider: 'mock',
      }),
    });

    const duration = Date.now() - startTime;
    stats.durations.push(duration);
    stats.total++;

    if (response.ok) {
      stats.success++;
      return { success: true, duration };
    } else {
      stats.failed++;
      return { success: false, duration, status: response.status };
    }
  } catch (error) {
    stats.failed++;
    stats.total++;
    return { success: false, error: error.message };
  }
}

async function runLoadTest() {
  console.log('\n🔥 AIRouter Load Test');
  console.log('═══════════════════════════════════════\n');
  console.log(`Configuration:`);
  console.log(`  Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(`  Requests per User: ${REQUESTS_PER_USER}`);
  console.log(`  Total Requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log(`  Target: ${BASE_URL}\n`);

  const startTime = Date.now();

  // Create users
  const users = Array.from({ length: CONCURRENT_USERS }, async () => {
    const requests = [];
    for (let i = 0; i < REQUESTS_PER_USER; i++) {
      requests.push(makeRequest());
    }
    return Promise.all(requests);
  });

  await Promise.all(users);

  const totalDuration = (Date.now() - startTime) / 1000;

  // Calculate statistics
  stats.durations.sort((a, b) => a - b);
  const p50 = stats.durations[Math.floor(stats.durations.length * 0.5)];
  const p95 = stats.durations[Math.floor(stats.durations.length * 0.95)];
  const p99 = stats.durations[Math.floor(stats.durations.length * 0.99)];
  const avg = stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length;
  const min = stats.durations[0];
  const max = stats.durations[stats.durations.length - 1];

  console.log('\n📊 Results:');
  console.log('═══════════════════════════════════════\n');
  console.log(`Total Time: ${totalDuration.toFixed(2)}s`);
  console.log(`Requests per Second: ${(stats.total / totalDuration).toFixed(2)}`);
  console.log(`\nRequests:`);
  console.log(`  Total: ${stats.total}`);
  console.log(`  Success: ${stats.success} (${((stats.success / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${stats.failed} (${((stats.failed / stats.total) * 100).toFixed(1)}%)`);
  console.log(`\nResponse Times (ms):`);
  console.log(`  Min: ${min}`);
  console.log(`  Avg: ${avg.toFixed(2)}`);
  console.log(`  P50: ${p50}`);
  console.log(`  P95: ${p95}`);
  console.log(`  P99: ${p99}`);
  console.log(`  Max: ${max}`);
  console.log('\n═══════════════════════════════════════\n');
}

runLoadTest().catch(console.error);

