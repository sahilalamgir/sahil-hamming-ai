import { create_scenarios } from '@/lib/create-scenarios';
import fs from 'fs/promises';
import path from 'path';

async function runTest() {
  try {
    // Define all input scenarios to test
    const testScenarios = [
      { name: 'clinic-receptionist', count: 2 },
      { name: 'drive-through', count: 2 },
      { name: 'customer-support', count: 2 },
      { name: 'hotel-concierge', count: 2 },
      { name: 'financial-advisor', count: 2 },
      { name: 'travel-booking', count: 2 },
      { name: 'fitness-coach', count: 2 }
    ];

    // Process each test scenario
    for (const scenario of testScenarios) {
      // Load test input file
      console.log(`\nGenerating ${scenario.name} scenarios...`);
      try {
        const inputPath = path.join(__dirname, `inputs/${scenario.name}.json`);
        const input = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
        
        // Generate scenarios
        const generatedScenarios = await create_scenarios(input, scenario.count);
        
        // Log abbreviated results
        console.log(`${scenario.name} scenarios generated: ${generatedScenarios.length}`);
        console.log(`First scenario name: ${generatedScenarios[0]?.scenarioName || 'None'}`);
        
        // Save output
        const outputPath = path.join(__dirname, `outputs/${scenario.name}-generated-output.json`);
        await fs.writeFile(
          outputPath, 
          JSON.stringify({ scenarios: generatedScenarios }, null, 2)
        );
        console.log(`Output saved to ${outputPath}`);
      } catch (error) {
        console.error(`Error testing ${scenario.name}:`, error);
      }
    }
    
    console.log('\nAll tests completed.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
runTest(); 