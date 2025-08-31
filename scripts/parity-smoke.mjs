#!/usr/bin/env node

/**
 * Parity Smoke Test - Verify 4 critical endpoints return 200
 * Usage: npm run parity:smoke
 */

import { spawn } from 'child_process';
import { setTimeout as delay } from 'timers/promises';

const ENDPOINTS = [
  '/',
  '/app.js', 
  '/assets/app.css',
  '/api/fetch'
];

const PORT = 53123; // Default Vite dev port
const BASE_URL = `http://localhost:${PORT}`;

async function checkEndpoint(endpoint) {
  return new Promise((resolve) => {
    const curl = spawn('curl', [
      '-s', '-o', '/dev/null', '-w', '%{http_code}',
      `${BASE_URL}${endpoint}`
    ]);
    
    let output = '';
    curl.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    curl.on('close', (code) => {
      const httpCode = parseInt(output.trim());
      resolve({
        endpoint,
        httpCode,
        success: httpCode === 200,
        curlExitCode: code
      });
    });
    
    curl.on('error', () => {
      resolve({
        endpoint,
        httpCode: 0,
        success: false,
        curlExitCode: 1,
        error: 'Connection failed'
      });
    });
  });
}

async function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting dev server...');
    
    const server = spawn('npm', ['run', 'dev'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let serverReady = false;
    
    server.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') && !serverReady) {
        serverReady = true;
        resolve(server);
      }
    });
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (!serverReady) {
        server.kill();
        reject(new Error('Dev server failed to start within 30 seconds'));
      }
    }, 30000);
  });
}

async function main() {
  let server = null;
  let exitCode = 0;
  
  try {
    // Start dev server
    server = await startDevServer();
    
    // Wait for server to be fully ready
    await delay(3000);
    
    console.log('🔍 Testing endpoints...');
    
    // Test all endpoints
    const results = await Promise.all(
      ENDPOINTS.map(endpoint => checkEndpoint(endpoint))
    );
    
    // Report results
    console.log('\\n📊 Results:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const code = result.httpCode || 'ERR';
      console.log(`${status} ${result.endpoint} → ${code}`);
      
      if (!result.success) {
        exitCode = 1;
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
    });
    
    const passCount = results.filter(r => r.success).length;
    console.log(`\\n🎯 ${passCount}/${results.length} endpoints passed`);
    
    if (exitCode === 0) {
      console.log('✅ All endpoints healthy!');
    } else {
      console.log('❌ Some endpoints failed!');
    }
    
  } catch (error) {
    console.error('💥 Smoke test failed:', error.message);
    exitCode = 1;
  } finally {
    // Clean up server
    if (server) {
      console.log('🛑 Stopping dev server...');
      server.kill();
      await delay(1000);
    }
  }
  
  process.exit(exitCode);
}

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});