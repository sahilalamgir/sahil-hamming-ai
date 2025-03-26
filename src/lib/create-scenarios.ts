import { GoogleGenerativeAI } from '@google/generative-ai';

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

interface GeminiResponse {
  scenarioName: string;
  scenarioDescription: string;
  criteria: string;
}

// Random data generation functions
function generateRandomName(): string {
  const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'Sarah', 'David', 'Karen', 'Richard', 'Susan', 'Emily', 'Thomas', 'Jessica', 'Carlos', 'Maria', 'Aisha', 'Wei', 'Jamal', 'Sofia'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'];
  
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateRandomDOB(): string {
  const year = 1950 + Math.floor(Math.random() * 60); // 1950 to 2010
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
}

function generateRandomPhone(): string {
  const area = 200 + Math.floor(Math.random() * 800);
  const prefix = 200 + Math.floor(Math.random() * 800);
  const lineNum = 1000 + Math.floor(Math.random() * 9000);
  
  return `${area}-${prefix}-${lineNum}`;
}

function generateRandomEmail(name: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'hotmail.com', 'aol.com', 'protonmail.com'];
  const nameParts = name.toLowerCase().split(' ');
  const emailPrefix = Math.random() > 0.5 ? 
    `${nameParts[0]}.${nameParts[1]}` : 
    `${nameParts[0]}${Math.floor(Math.random() * 1000)}`;
  
  return `${emailPrefix}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function generateRandomGender(): string {
  const genders = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  return genders[Math.floor(Math.random() * genders.length)];
}

function generateRandomInsurance(): string {
  const insurances = ['Aetna', 'Blue Cross Blue Shield', 'Cigna', 'UnitedHealthcare', 'Humana', 'Kaiser Permanente', 'Medicare', 'Medicaid', 'Anthem', 'None'];
  return insurances[Math.floor(Math.random() * insurances.length)];
}

/**
 * Calls Gemini API to infer scenario details based on the input agent configuration.
 * If API key is invalid or there's an error, falls back to mock responses.
 */
async function callGeminiAPI(input: any): Promise<GeminiResponse> {
  try {
    // Using Google's Generative AI Node.js client
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    // Check if API key looks valid
    if (!apiKey || apiKey.includes('0000000')) {
      console.log('Using mock response - API key appears to be invalid');
      return getMockResponse(input);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
    Given the following voice agent configuration, infer a realistic scenario name, 
    scenario description, and criteria for testing this agent. The scenario should 
    represent a realistic interaction a user might have with this agent.
    
    Voice Agent Configuration:
    ${JSON.stringify(input, null, 2)}
    
    Please respond with a JSON object containing:
    - scenarioName: A brief title for the scenario
    - scenarioDescription: A detailed description of the interaction
    - criteria: Specific success criteria for evaluating the agent's performance
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Parse the response as JSON
    return JSON.parse(text);
  } catch (error) {
    console.error('Error calling Gemini API, using mock response:', error);
    return getMockResponse(input);
  }
}

/**
 * Provides mock responses based on the input configuration
 */
function getMockResponse(input: any): GeminiResponse {
  // Check if it's a clinic configuration
  const isClinic = input?.agentConfig?.initialState?.name === 'INFORMATION_COLLECTION';
  const isDriveThrough = input?.agentConfig?.initialState?.name === 'ORDER_TAKING';
  
  // Clinic mock scenarios
  const clinicScenarios = [
    {
      scenarioName: "Returning Patient - Basic Appointment Request",
      scenarioDescription: "John Doe, a returning patient, calls the clinic to set up a follow-up appointment. He provides his phone number, which the system has on file from a previous visit. He expects the agent to correctly recognize him as a returning patient and confirm his existing details. He wants to schedule a general check-up for next week. He also wonders if his insurance is still on file or if he needs to provide updated information.",
      criteria: "The agent smoothly recognizes John as a returning patient using his phone number, verifies personal details, and helps schedule a check-up appointment."
    },
    {
      scenarioName: "New Patient - Insurance Verification",
      scenarioDescription: "Sarah Miller is a new patient calling to verify if the clinic accepts her insurance plan before booking her first appointment. She needs to see a specialist for ongoing migraines and wants to understand the referral process.",
      criteria: "The agent should collect Sarah's information as a new patient, verify her insurance details, and explain the clinic's referral process for specialists."
    },
    {
      scenarioName: "Medical History Discussion",
      scenarioDescription: "Robert Johnson calls to discuss his recent lab results and medical history before his upcoming appointment. He has questions about his medication dosage and wants to ensure the doctor has his complete medical history.",
      criteria: "The agent should transition to HPI_COLLECTION state, gather Robert's medical information systematically, and reassure him that his concerns will be addressed during his appointment."
    }
  ];
  
  // Drive-through mock scenarios
  const driveThruScenarios = [
    {
      scenarioName: "Family Meal Order with Customizations",
      scenarioDescription: "A parent ordering dinner for their family of four, with several customizations (no pickles on two burgers, extra sauce on another, kids meal with apple slices instead of fries) and asking about allergen information for the dessert menu.",
      criteria: "The assistant accurately captures all customizations, provides allergen information, and summarizes the complete order correctly."
    },
    {
      scenarioName: "Breakfast Rush Regular Customer",
      scenarioDescription: "A regular morning customer who usually orders the same breakfast combo but today wants to modify their drink selection and try a new promotional item they saw advertised.",
      criteria: "The assistant handles the modified order efficiently, explains the promotional item, and processes the transaction quickly as appropriate for a breakfast rush scenario."
    },
    {
      scenarioName: "Payment Issue Resolution",
      scenarioDescription: "A customer whose credit card is declined during payment processing and needs to use an alternative payment method while holding up the drive-through line.",
      criteria: "The assistant handles the payment issue calmly, offers alternative payment options, and maintains a professional demeanor throughout the potentially stressful interaction."
    }
  ];
  
  if (isClinic) {
    return clinicScenarios[Math.floor(Math.random() * clinicScenarios.length)];
  } else if (isDriveThrough) {
    return driveThruScenarios[Math.floor(Math.random() * driveThruScenarios.length)];
  } else {
    // Default scenario if we can't determine the type
    return {
      scenarioName: "Generic Test Scenario",
      scenarioDescription: "A basic test scenario to evaluate the agent's core functionality and response patterns.",
      criteria: "The agent should respond appropriately to basic user inquiries and follow its configured workflow."
    };
  }
}

/**
 * Creates test scenarios for voice agents.
 * Uses Gemini API to infer scenario details and random generators for user details.
 * 
 * @param input The agent configuration to generate scenarios for
 * @param num_scenarios Number of scenarios to generate
 * @returns Array of generated scenarios
 */
export async function create_scenarios(input: any, num_scenarios: number): Promise<Scenario[]> {
  const scenarios: Scenario[] = [];
  
  try {
    for (let i = 0; i < num_scenarios; i++) {
      // Call Gemini API to infer scenario details
      const geminiResponse = await callGeminiAPI(input);
      
      // Generate random user details
      const name = generateRandomName();
      const dob = generateRandomDOB();
      const phone = generateRandomPhone();
      const email = generateRandomEmail(name);
      const gender = generateRandomGender();
      const insurance = generateRandomInsurance();
      
      // Combine AI-generated and random data
      scenarios.push({
        scenarioName: geminiResponse.scenarioName,
        scenarioDescription: geminiResponse.scenarioDescription,
        name,
        dob,
        phone,
        email,
        gender,
        insurance,
        criteria: geminiResponse.criteria
      });
    }
    
    return scenarios;
  } catch (error) {
    console.error("Error generating scenarios:", error);
    throw error;
  }
}
