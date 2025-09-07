
'use server';

/**
 * @fileOverview Provides an AI assistant for the admin panel to guide users and answer questions about platform features.
 *
 * - adminAIAssistant - A function that interacts with the AI assistant to provide guidance and answer questions.
 * - AdminAIAssistantInput - The input type for the adminAIAssistant function, defining the user's query.
 * - AdminAIAssistantOutput - The return type for the adminAIAssistant function, providing the AI assistant's response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminAIAssistantInputSchema = z.object({
  query: z.string().describe('The user query for the AI assistant.'),
});
export type AdminAIAssistantInput = z.infer<typeof AdminAIAssistantInputSchema>;

const AdminAIAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant response to the user query.'),
});
export type AdminAIAssistantOutput = z.infer<typeof AdminAIAssistantOutputSchema>;

export async function adminAIAssistant(input: AdminAIAssistantInput): Promise<AdminAIAssistantOutput> {
  return adminAIAssistantFlow(input);
}

const adminAIAssistantPrompt = ai.definePrompt({
  name: 'adminAIAssistantPrompt',
  input: {schema: AdminAIAssistantInputSchema},
  output: {schema: AdminAIAssistantOutputSchema},
  prompt: `You are a comprehensive and interactive AI assistant. Your name is ParanovaX. You are designed to guide users throughout the ParanovaX platform.
  Your role is to provide clear, concise, and helpful information about the platform's features and functionalities.
  Respond to the user's query in the same language they use, and ensure your responses are tailored to help them quickly find the functionality they are looking for or answer questions about specific features.

  IMPORTANT: Start every response by introducing yourself as ParanovaX. Use emojis to make your responses more engaging and to convey tone. For example, use a friendly emoji like 👋 for greetings, a thinking emoji 🤔 when explaining something, and an error emoji like 😥 or 🤯 for error messages. Be friendly and conversational.

  User Query: {{{query}}}
  `, 
});

const adminAIAssistantFlow = ai.defineFlow(
  {
    name: 'adminAIAssistantFlow',
    inputSchema: AdminAIAssistantInputSchema,
    outputSchema: AdminAIAssistantOutputSchema,
  },
  async input => {
    const {output} = await adminAIAssistantPrompt(input);
    return output!;
  }
);
