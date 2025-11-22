'use server';

/**
 * @fileOverview A Genkit flow for comparing two interview performances.
 *
 * - compareInterviews - A function that handles the interview comparison process.
 * - CompareInterviewsInput - The input type for the compareInterviews function.
 * - CompareInterviewsOutput - The return type for the compareInterviews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareInterviewsInputSchema = z.object({
  currentJobDescription: z.string().describe('The job description for the current interview.'),
  currentInterviewTranscript: z.string().describe('The transcript of the current interview.'),
  currentInterviewScore: z.number().describe('The score of the current interview.'),
  previousJobDescription: z.string().describe('The job description for the previous interview.'),
  previousInterviewTranscript: z.string().describe('The transcript of the previous interview.'),
  previousInterviewScore: z.number().describe('The score of the previous interview.'),
});
export type CompareInterviewsInput = z.infer<typeof CompareInterviewsInputSchema>;

const ComparisonSkillScoreSchema = z.object({
  skill: z.string().describe('The name of the skill being assessed (e.g., "Clarity", "Confidence", "Relevance").'),
  previousScore: z.number().min(0).max(10).describe('The score for this skill in the previous interview.'),
  currentScore: z.number().min(0).max(10).describe('The score for this skill in the current interview.'),
});

const CompareInterviewsOutputSchema = z.object({
  comparisonReport: z
    .string()
    .describe(
      'A detailed report comparing the two interviews, highlighting improvements and areas for further development.'
    ),
  skillScores: z
    .array(ComparisonSkillScoreSchema)
    .describe('An array of scores for different skills for both interviews.'),
});
export type CompareInterviewsOutput = z.infer<typeof CompareInterviewsOutputSchema>;

export async function compareInterviews(input: CompareInterviewsInput): Promise<CompareInterviewsOutput> {
  return compareInterviewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareInterviewsPrompt',
  input: {schema: CompareInterviewsInputSchema},
  output: {schema: CompareInterviewsOutputSchema},
  prompt: `You are an expert career coach. Your task is to compare two interview performances and provide a constructive analysis of the user's progress.

Here is the data for the two interviews:

**Previous Interview:**
- Score: {{{previousInterviewScore}}}/10
- Job Description: {{{previousJobDescription}}}
- Transcript:
{{{previousInterviewTranscript}}}

**Current Interview:**
- Score: {{{currentInterviewScore}}}/10
- Job Description: {{{currentJobDescription}}}
- Transcript:
{{{currentInterviewTranscript}}}

First, analyze both interviews and assign a score (from 1 to 10) for each of the following three skills for both the previous and current interviews:
1.  **Clarity & Conciseness:** How clear and to-the-point the answers were.
2.  **Confidence & Communication:** Assess posture, eye contact, gestures, pace, tone, and use of filler words.
3.  **Relevance to Job Description:** How well the answers aligned with the skills and experience requested in the job description.

Populate the \`skillScores\` array with this data.

Next, provide a comparison report in the \`comparisonReport\` field that covers the following points:
1.  **Overall Score Change:** Comment on the change in the overall score.
2.  **Key Improvements:** Identify specific areas where the user has shown clear improvement between the two interviews. Use examples from the transcripts and reference the skill scores.
3.  **Areas for Continued Focus:** Point out any areas that still need work, or new issues that may have appeared in the current interview.
4.  **Actionable Advice:** Based on the comparison, provide 1-2 key actionable tips for the user to focus on for their next interview.

Keep the tone encouraging and constructive. Format the output as a concise report.
`,
});

const compareInterviewsFlow = ai.defineFlow(
  {
    name: 'compareInterviewsFlow',
    inputSchema: CompareInterviewsInputSchema,
    outputSchema: CompareInterviewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
