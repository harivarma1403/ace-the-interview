'use server';

/**
 * @fileOverview A flow for simulating interview questions based on a job description.
 *
 * - simulateInterviewQuestions - A function that simulates interview questions.
 * - SimulateInterviewQuestionsInput - The input type for the simulateInterviewQuestions function.
 * - SimulateInterviewQuestionsOutput - The return type for the simulateInterviewQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateInterviewQuestionsInputSchema = z.object({
  jobDescription: z.string().describe('The job description for which to simulate interview questions.'),
  numberOfQuestions: z.number().default(3).describe('The number of interview questions to generate.'),
});
export type SimulateInterviewQuestionsInput = z.infer<typeof SimulateInterviewQuestionsInputSchema>;

const SimulateInterviewQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('An array of simulated interview questions.'),
});
export type SimulateInterviewQuestionsOutput = z.infer<typeof SimulateInterviewQuestionsOutputSchema>;

export async function simulateInterviewQuestions(
  input: SimulateInterviewQuestionsInput
): Promise<SimulateInterviewQuestionsOutput> {
  return simulateInterviewQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateInterviewQuestionsPrompt',
  input: {schema: SimulateInterviewQuestionsInputSchema},
  output: {schema: SimulateInterviewQuestionsOutputSchema},
  prompt: `You are an expert interview question generator. Given a job description, you will generate a list of interview questions that are relevant to the role.

Job Description: {{{jobDescription}}}

Number of Questions: {{{numberOfQuestions}}}

Questions:`,
});

const simulateInterviewQuestionsFlow = ai.defineFlow(
  {
    name: 'simulateInterviewQuestionsFlow',
    inputSchema: SimulateInterviewQuestionsInputSchema,
    outputSchema: SimulateInterviewQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input, {config: {temperature: 1}});
    return output!;
  }
);
