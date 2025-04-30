import type { Threat } from '@/lib/types'; // Import Threat type

/**
 * Represents details about a system.
 */
export interface SystemDetails {
  /**
   * A description of the system.
   */
  description: string;
}


/**
 * Asynchronously retrieves potential threats based on system details.
 *
 * @param systemDetails The details of the system.
 * @returns A promise that resolves to an array of Threat objects.
 */
export async function getThreats(systemDetails: SystemDetails): Promise<Threat[]> {
  // TODO: Implement this by calling an external threat intelligence API.
  // For now, return mock data after a short delay to simulate network request.

  console.log("Fetching threats for system:", systemDetails.description.substring(0, 50) + "..."); // Log for debugging

   await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay


  // Example: Return different threats based on keywords in description
  if (systemDetails.description.toLowerCase().includes('database')) {
     return [
      {
        name: 'SQL Injection',
        description: 'A code injection technique that might exploit security vulnerabilities in a database layer.',
      },
      {
        name: 'Data Exfiltration',
        description: 'Unauthorized transfer of data from a computer or other device.',
      },
       {
        name: 'Insecure Database Configuration',
        description: 'Misconfigurations in the database settings that could expose data or allow unauthorized access.',
      },
    ];
  }

   if (systemDetails.description.toLowerCase().includes('web app') || systemDetails.description.toLowerCase().includes('frontend')) {
     return [
      {
        name: 'Cross-Site Scripting (XSS)',
        description: 'A type of security vulnerability typically found in web applications, allowing attackers to inject client-side scripts into web pages viewed by other users.',
      },
       {
        name: 'Cross-Site Request Forgery (CSRF)',
        description: 'An attack that forces an end user to execute unwanted actions on a web application in which they are currently authenticated.',
      },
       {
        name: 'Insecure Direct Object References (IDOR)',
        description: 'Occurs when an application provides direct access to objects based on user-supplied input.',
      },
    ];
   }


  // Default mock threats
  return [
    {
      name: 'Denial of Service (DoS)',
      description: 'An attack meant to shut down a machine or network, making it inaccessible to its intended users.',
    },
    {
      name: 'Phishing',
      description: 'Attempting to acquire sensitive information such as usernames, passwords, and credit card details by masquerading as a trustworthy entity.',
    },
     {
      name: 'Malware Infection',
      description: 'Software intentionally designed to cause damage to a computer, server, client, or computer network.',
    },
  ];
}
