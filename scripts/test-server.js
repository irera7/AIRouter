#!/usr/bin/env node
/**
 * Simple test script to verify server functionality
 */

import { buildApp } from '../backend/src/app.js';

async function main() {
  try {
    console.log('🚀 Building app...');
    const app = await buildApp();
    
    console.log('✅ App built successfully');
    console.log('🎯 Starting server on port 3000...');
    
    await app.listen({ port: 3000, host: '0.0.0.0' });
    
    console.log('✅ Server started successfully!');
    console.log('📚 Health check: http://localhost:3000/health');
    console.log('🔑 API: http://localhost:3000/api/v1');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();


