'use server';
/**
 * @fileOverview An AI agent that suggests potential threats and vulnerabilities based on system details.
 *
 * - suggestThreats - A function that suggests potential threats and vulnerabilities.
 * - SuggestThreatsInput - The input type for the suggestThreats function.
 * - SuggestThreatsOutput - The return type for the suggestThreats function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {getThreats, SystemDetails} from '@/services/threat-intelligence';
import type { Threat } from '@/lib/types'; // Import shared Threat type

const SuggestThreatsInputSchema = z.object({
  systemDetails: z.object({
    description: z.string().describe('A detailed description of the system, including architecture, technologies, data flow, and user types.'),
  }).describe('The details of the system to be analyzed for threats.'),
});
export type SuggestThreatsInput = z.infer<typeof SuggestThreatsInputSchema>;

const ThreatSchema = z.object({
  name: z.string().describe('The concise name of the potential threat (e.g., SQL Injection, Cross-Site Scripting).'),
  description: z.string().describe('A brief explanation of the threat and how it might apply to the described system.'),
});

const SuggestThreatsOutputSchema = z.object({
  threats: z.array(ThreatSchema).describe('A list of potential threats relevant to the provided system details.'),
});
export type SuggestThreatsOutput = z.infer<typeof SuggestThreatsOutputSchema>;

export async function suggestThreats(input: SuggestThreatsInput): Promise<SuggestThreatsOutput> {
  return suggestThreatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestThreatsPrompt',
  input: {
    schema: SuggestThreatsInputSchema, // Use defined input schema
  },
  output: {
    schema: SuggestThreatsOutputSchema, // Use defined output schema
  },
  prompt: `You are a cybersecurity expert specializing in threat modeling. Analyze the following system description and identify potential security threats and vulnerabilities. Be specific and consider common attack vectors relevant to the described components and technologies.

System Details:
\`\`\`
{{{systemDetails.description}}}
\`\`\`

Return your findings as a JSON object containing a key "threats", which is an array of objects. Each object in the array should have a "name" (string) and a "description" (string) property. Focus on the most relevant and impactful threats.`,
});


const suggestThreatsFlow = ai.defineFlow<
  typeof SuggestThreatsInputSchema,
  typeof SuggestThreatsOutputSchema
>({
  name: 'suggestThreatsFlow',
  inputSchema: SuggestThreatsInputSchema,
  outputSchema: SuggestThreatsOutputSchema,
}, async input => {
  // Call the threat intelligence service first (optional step, could be primary)
  try {
     const serviceThreats: Threat[] = await getThreats(input.systemDetails);
     if (serviceThreats && serviceThreats.length > 0) {
        console.log("Using threats from external service.");
       // Ensure the format matches the expected output schema
       const formattedThreats = serviceThreats.map(t => ({ name: t.name, description: t.description }));
       return { threats: formattedThreats };
     }
   } catch (serviceError) {
     console.warn("Threat intelligence service call failed or returned no results, falling back to LLM.", serviceError);
     // Proceed to LLM if service fails or returns empty
   }


  // If the service didn't provide threats, use the LLM.
   console.log("Using LLM to suggest threats.");
   const { output, usage } = await prompt(input);


  if (!output) {
     throw new Error("AI failed to generate threat suggestions.");
   }

   console.log("LLM Usage:", usage);
   return output; // Output already conforms to SuggestThreatsOutputSchema
});
