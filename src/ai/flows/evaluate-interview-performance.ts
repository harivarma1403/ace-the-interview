
'use server';

/**
 * @fileOverview This file defines a Genkit flow for evaluating interview performance and providing feedback.
 *
 * - evaluateInterviewPerformance - A function that handles the interview evaluation process.
 * - EvaluateInterviewPerformanceInput - The input type for the evaluateInterviewPerformance function.
 * - EvaluateInterviewPerformanceOutput - The return type for the evaluateInterviewPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateInterviewPerformanceInputSchema = z.object({
  jobDescription: z.string().describe('The job description for the role.'),
  interviewTranscript: z.string().describe('The transcript of the interview, including audio and video analysis.'),
});
export type EvaluateInterviewPerformanceInput = z.infer<typeof EvaluateInterviewPerformanceInputSchema>;

const EvaluateInterviewPerformanceOutputSchema = z.object({
  score: z.number().min(0).max(10).describe('An overall score of the interview performance on a scale of 1 to 10.'),
  feedbackReport: z.string().describe('A detailed feedback report of the interview performance, including analysis of communication skills, body language, and knowledge.'),
});
export type EvaluateInterviewPerformanceOutput = z.infer<typeof EvaluateInterviewPerformanceOutputSchema>;

export async function evaluateInterviewPerformance(input: EvaluateInterviewPerformanceInput): Promise<EvaluateInterviewPerformanceOutput> {
  return evaluateInterviewPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateInterviewPerformancePrompt',
  input: {schema: EvaluateInterviewPerformanceInputSchema},
  output: {schema: EvaluateInterviewPerformanceOutputSchema},
  prompt: `You are an expert interview evaluator and career coach. Your task is to analyze an interview transcript, which includes analysis from the user's video and audio, based on the provided job description.

First, provide an overall score for the interview on a scale of 1 to 10, where 1 is poor and 10 is excellent. Be critical and fair in your assessment.

Then, provide a comprehensive feedback report. Structure your feedback with clear headings and bullet points for each section to make it easy to read. Each point, suggestion, or observation must be on a new line. The report must cover the following areas:

**1. Clarity and Conciseness:**
- Assess how clear and to-the-point the answers were.
- Provide specific examples from the transcript.

**2. Confidence and Body Language:**
- Analyze posture, eye contact, and gestures based on the video analysis.
- Comment on the candidate's perceived confidence level.

**3. Speaking Skills:**
- Evaluate the pace, tone, and use of filler words (e.g., "um," "uh") from the audio analysis.

**4. Relevance to Job Description:**
- Analyze how well the answers aligned with the skills and experience requested in the job description.

**5. Strengths & Weaknesses:**
- Provide a bulleted list of key strengths.
- Provide a bulleted list of areas for improvement.

**6. Actionable Advice:**
- Offer specific, actionable tips for improvement. Present these as a numbered list. Each tip should be on a new line.

Job Description: {{{jobDescription}}}

Interview Transcript and Analysis: {{{interviewTranscript}}}

Provide the feedback in a detailed, constructive, and encouraging report. Ensure the entire report is well-formatted and easy to scan.`,
});

const evaluateInterviewPerformanceFlow = ai.defineFlow(
  {
    name: 'evaluateInterviewPerformanceFlow',
    inputSchema: EvaluateInterviewPerformanceInputSchema,
    outputSchema: EvaluateInterviewPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
