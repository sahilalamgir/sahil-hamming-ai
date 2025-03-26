"use client";

import { useState } from "react";
import { create_scenarios } from '@/lib/create-scenarios';

interface Scenario {
  scenarioName: string;
  scenarioDescription: string;
  name: string;
  dob: string;
  phone: string;
  email: string;
  gender: string;
  insurance: string;
  criteria: string;
}

export default function Home() {
  const [inputConfig, setInputConfig] = useState("");
  const [numScenarios, setNumScenarios] = useState(3);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateScenarios = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Parse the input configuration
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(inputConfig);
      } catch (e) {
        throw new Error("Invalid JSON input. Please check your configuration.");
      }
      
      // Generate scenarios
      const generatedScenarios = await create_scenarios(parsedConfig, numScenarios);
      setScenarios(generatedScenarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Scenario Generator</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="mb-6">
            <label htmlFor="inputConfig" className="block mb-2 font-medium">
              Agent Configuration (JSON)
            </label>
            <textarea
              id="inputConfig"
              className="w-full h-96 p-4 border border-gray-300 rounded-md"
              value={inputConfig}
              onChange={(e) => setInputConfig(e.target.value)}
              placeholder='Enter your agent configuration JSON...'
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="numScenarios" className="block mb-2 font-medium">
              Number of Scenarios
            </label>
            <input
              id="numScenarios"
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={numScenarios}
              onChange={(e) => setNumScenarios(parseInt(e.target.value) || 1)}
              min="1"
              max="10"
            />
          </div>
          
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md"
            onClick={handleGenerateScenarios}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Scenarios"}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Example Inputs</h2>
            <p className="mb-2">You can try these sample configurations:</p>
            <button
              className="text-black bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded-md mr-2"
              onClick={() => {
                fetch('/api/samples?type=clinic')
                  .then(res => res.json())
                  .then(data => setInputConfig(JSON.stringify(data, null, 2)))
                  .catch(() => setError("Failed to load sample configuration"));
              }}
            >
              Clinic Receptionist
            </button>
            <button
              className="text-black bg-gray-200 hover:bg-gray-300 py-1 px-3 rounded-md"
              onClick={() => {
                fetch('/api/samples?type=drivethrough')
                  .then(res => res.json())
                  .then(data => setInputConfig(JSON.stringify(data, null, 2)))
                  .catch(() => setError("Failed to load sample configuration"));
              }}
            >
              Drive-Through Assistant
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Generated Scenarios</h2>
          
          {scenarios.length === 0 ? (
            <p className="text-gray-500">No scenarios generated yet.</p>
          ) : (
            <div className="space-y-6">
              {scenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-300 rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2">{scenario.scenarioName}</h3>
                  <p className="mb-4 text-sm">{scenario.scenarioDescription}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {scenario.name}
                    </div>
                    <div>
                      <span className="font-medium">DOB:</span> {scenario.dob}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {scenario.phone}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {scenario.email}
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span> {scenario.gender}
                    </div>
                    <div>
                      <span className="font-medium">Insurance:</span> {scenario.insurance}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="font-medium">Criteria:</span> 
                    <p className="text-sm mt-1">{scenario.criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
