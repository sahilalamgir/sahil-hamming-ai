/**
 * Main test runner that executes all scenario tests and validations
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

async function ensureDirectories() {
  const dirs = [
    path.join(__dirname, 'outputs'),
    path.join(__dirname, 'inputs')
  ];
  
  for (const dir of dirs) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }
}

function runCommand(command: string, args: string[]): Promise<number> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { 
      stdio: 'inherit',
      shell: true
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive scenario tests\n');
  
  try {
    // Ensure output directories exist
    await ensureDirectories();
    
    // Step 1: Generate all scenarios
    console.log('📝 STEP 1: Generating scenarios for all agent types');
    await runCommand('npx', ['tsx', 'tests/test-scenarios.ts']);
    
    // Step 2: Compare expected vs generated
    console.log('\n🔍 STEP 2: Comparing generated scenarios against expected formats');
    await runCommand('npx', ['tsx', 'tests/compare-scenarios.ts']);
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\nTest Summary:');
    console.log('- Generated scenarios for multiple agent types');
    console.log('- Validated structure of generated scenarios');
    console.log('- Verified required fields are present');
    
  } catch (error: any) {
    console.error('\n❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests(); 