
'use server';

/**
 * @fileOverview An AI agent for auto-filling client details based on name and firm name.
 *
 * - autofillClientDetails - A function that suggests client details using AI.
 * - AutofillClientDetailsInput - The input type for the autofillClientDetails function.
 * - AutofillClientDetailsOutput - The return type for the autofillClientDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { indianStates } from '@/lib/locations';

const AutofillClientDetailsInputSchema = z.object({
  firstName: z.string().describe('The first name of the client.'),
  lastName: z.string().describe('The last name of the client.'),
  firmName: z.string().describe("The name of the client's firm."),
  availableStates: z.array(z.string()).describe("A list of valid Indian states to choose from.")
});
export type AutofillClientDetailsInput = z.infer<typeof AutofillClientDetailsInputSchema>;

const AutofillClientDetailsOutputSchema = z.object({
  email: z.string().email('A plausible email address for the client. Should follow a standard format like firstname.lastname@firmname.com').describe('A plausible email address for the client.'),
  mobile: z.string().regex(/^\d{10}$/, "A plausible 10-digit mobile number, must not contain any letters or symbols.").describe('A plausible 10-digit mobile number for the client.'),
  state: z.string().describe('A plausible state for the client.'),
  district: z.string().describe('A plausible district within the suggested state.'),
});
export type AutofillClientDetailsOutput = z.infer<typeof AutofillClientDetailsOutputSchema>;

export async function autofillClientDetails(
  input: Omit<AutofillClientDetailsInput, 'availableStates'>
): Promise<AutofillClientDetailsOutput> {
  const availableStates = indianStates.map(s => s.name);
  return autofillClientDetailsFlow({...input, availableStates});
}

const prompt = ai.definePrompt({
  name: 'autofillClientDetailsPrompt',
  input: {schema: AutofillClientDetailsInputSchema},
  output: {schema: AutofillClientDetailsOutputSchema},
  prompt: `You are an AI assistant designed to help with data entry. Based on the user's input of a client's name and firm name, generate plausible, realistic, but entirely fictional contact details.

  User Input:
  First Name: {{{firstName}}}
  Last Name: {{{lastName}}}
  Firm Name: {{{firmName}}}

  Generate the following details based on these rules:
  1.  **Email:** Create a plausible but fake email address. The format should be based on the user's name and firm name (e.g., fletcher.boyle@boyleassociates.com). The domain should be derived from the firm name, and it should be a .com domain.
  2.  **Mobile:** Generate a random but valid-looking 10-digit Indian mobile number. It must start with a digit between 6 and 9.
  3.  **Location:** You MUST pick a state from the following list. After selecting a state, you MUST pick a valid district for that state.

  List of available states:
  {{#each availableStates}}
  - {{this}}
  {{/each}}

  Provide ONLY the JSON output based on the schema.
  `,
});

const autofillClientDetailsFlow = ai.defineFlow(
  {
    name: 'autofillClientDetailsFlow',
    inputSchema: AutofillClientDetailsInputSchema,
    outputSchema: AutofillClientDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
