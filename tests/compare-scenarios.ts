/**
 * This script compares expected scenario outputs with those generated by the create_scenarios function
 * It helps validate that the scenario generation works as expected
 */

import fs from 'fs/promises';
import path from 'path';

async function compareScenarios() {
  try {
    // Get all output files
    const outputsDir = path.join(__dirname, 'outputs');
    const files = await fs.readdir(outputsDir);
    
    // Filter for expected output files (those without "generated" in the name)
    const expectedFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('generated') && 
      file !== 'expected-scenario-format.json'
    );
    
    console.log('Comparing expected scenario structures with generated scenarios...\n');
    
    // Check each expected output file
    for (const expectedFile of expectedFiles) {
      try {
        const baseName = expectedFile.replace('-output.json', '');
        const generatedFile = `${baseName}-generated-output.json`;
        
        // Check if generated output exists
        if (!files.includes(generatedFile)) {
          console.log(`❌ No generated output for ${baseName}`);
          continue;
        }
        
        // Load both files
        const expectedContent = JSON.parse(
          await fs.readFile(path.join(outputsDir, expectedFile), 'utf-8')
        );
        
        const generatedContent = JSON.parse(
          await fs.readFile(path.join(outputsDir, generatedFile), 'utf-8')
        );
        
        // Basic validation
        if (!expectedContent.scenarios || !Array.isArray(expectedContent.scenarios)) {
          console.log(`❌ Invalid expected output format for ${baseName}`);
          continue;
        }
        
        if (!generatedContent.scenarios || !Array.isArray(generatedContent.scenarios)) {
          console.log(`❌ Invalid generated output format for ${baseName}`);
          continue;
        }
        
        // Structure validation - check if the first generated scenario has all required fields
        const requiredFields = ['scenarioName', 'scenarioDescription', 'criteria'];
        const firstGenerated = generatedContent.scenarios[0];
        
        const missingFields = requiredFields.filter(field => !firstGenerated || !firstGenerated[field]);
        
        if (missingFields.length > 0) {
          console.log(`❌ ${baseName}: Missing required fields: ${missingFields.join(', ')}`);
        } else {
          console.log(`✅ ${baseName}: Generated scenarios have all required fields`);
          console.log(`   Sample generated scenario: "${firstGenerated.scenarioName}"`);
        }
        
      } catch (error: any) {
        console.error(`Error comparing ${expectedFile}:`, error.message);
      }
    }
    
    console.log('\nComparison complete.');
    
  } catch (error: any) {
    console.error('Comparison failed:', error);
  }
}

// Run the comparison
compareScenarios(); 