'use server';

/**
 * @fileOverview A Genkit flow for grading a resume.
 *
 * - gradeResume - A function that handles the resume grading process.
 * - GradeResumeInput - The input type for the gradeResume function.
 * - GradeResumeOutput - The return type for the gradeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeResumeInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the user's resume."),
});
export type GradeResumeInput = z.infer<typeof GradeResumeInputSchema>;

const GradeResumeOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('An overall "ATS score" (Applicant Tracking System) from 1 to 100, representing the general quality and effectiveness of the resume.'),
  report: z.string().describe('A detailed report analyzing the resume. It should include sections for Strengths, Weaknesses, and Actionable Suggestions for improvement. Each point must be on a new line.'),
});
export type GradeResumeOutput = z.infer<typeof GradeResumeOutputSchema>;

export async function gradeResume(input: GradeResumeInput): Promise<GradeResumeOutput> {
  return gradeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeResumePrompt',
  input: {schema: GradeResumeInputSchema},
  output: {schema: GradeResumeOutputSchema},
  prompt: `You are an expert career coach and professional resume writer. Your task is to analyze a resume and provide an "ATS Score" (Applicant Tracking System Score) out of 100.

First, carefully review the user's Resume.

Then, calculate the ATS Score based on the following criteria:
- **Impact & Action Verbs (40%):** How well does the resume use strong action verbs and quantify achievements?
- **Clarity & Readability (30%):** How clear, concise, and well-structured is the resume? Is it easy to read and understand?
- **Completeness & Professionalism (30%):** Does the resume contain all necessary sections (e.g., Experience, Education, Skills)? Is it free of grammatical errors and typos?

After determining the score, generate a detailed report. The report must be structured with the following headings, and each point, suggestion, or observation must be on a new line:

**1. Strengths:**
- Highlight 2-3 key areas where the resume is strong.

**2. Areas for Improvement:**
- Identify 2-3 specific weaknesses or gaps in the resume.

**3. Actionable Suggestions:**
- Provide a numbered list of concrete, actionable tips on how to improve the resume. For example, "Consider adding a project that showcases your technical skills..." or "Quantify your achievements in your previous role by including metrics, such as 'improved performance by 15%'."

**Resume Text:**
{{{resumeText}}}

Provide a fair but critical assessment to help the user improve their chances of getting an interview.
`,
});

const gradeResumeFlow = ai.defineFlow(
  {
    name: 'gradeResumeFlow',
    inputSchema: GradeResumeInputSchema,
    outputSchema: GradeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
