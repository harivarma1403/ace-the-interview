'use server';

import { z } from 'zod';
import { evaluateInterviewPerformance } from '@/ai/flows/evaluate-interview-performance';
import { simulateInterviewQuestions } from '@/ai/flows/simulate-interview-questions';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import { compareInterviews } from '@/ai/flows/compare-interviews';
import { SkillScore } from '@/components/app/interview-flow';
import { gradeResume } from '@/ai/flows/grade-resume';

const startInterviewSchema = z.object({
  jobDescription: z.string(),
});

export async function startInterviewAction(formData: FormData) {
  const parsed = startInterviewSchema.safeParse({
    jobDescription: formData.get('jobDescription'),
  });

  if (!parsed.success) {
    return { status: 'error' as const, message: parsed.error.errors[0].message };
  }
  
  if (parsed.data.jobDescription.trim().length === 0) {
    return { status: 'error' as const, message: 'Job description cannot be empty.' };
  }

  try {
    const { questions } = await simulateInterviewQuestions({
      jobDescription: parsed.data.jobDescription,
      numberOfQuestions: 5,
    });
    return { status: 'success' as const, questions };
  } catch (error) {
    console.error(error);
    return { status: 'error' as const, message: 'Failed to generate questions. Please try again.' };
  }
}

const getFeedbackSchema = z.object({
  jobDescription: z.string(),
  interviewTranscript: z.string(),
});

export async function getFeedbackAction(data: { jobDescription: string; interviewTranscript: string }) {
  const parsed = getFeedbackSchema.safeParse(data);

  if (!parsed.success) {
    return { status: 'error' as const, message: 'Invalid input for feedback generation.' };
  }

  try {
    const { feedbackReport, score } = await evaluateInterviewPerformance(parsed.data);
    return { status: 'success' as const, feedbackReport, score };
  } catch (error) {
    console.error(error);
    return { status: 'error' as const, message: 'Failed to generate feedback. Please try again.' };
  }
}

const transcribeAudioSchema = z.object({
    audioDataUri: z.string(),
});

export async function transcribeAudioAction(data: { audioDataUri: string }) {
    const parsed = transcribeAudioSchema.safeParse(data);

    if (!parsed.success) {
        return { status: 'error' as const, message: 'Invalid audio data.' };
    }

    try {
        const { transcript } = await transcribeAudio(parsed.data);
        return { status: 'success' as const, transcript };
    } catch (error) {
        console.error(error);
        return { status: 'error' as const, message: 'Failed to transcribe audio. Please try again.' };
    }
}

const compareInterviewsSchema = z.object({
  currentJobDescription: z.string(),
  currentInterviewTranscript: z.string(),
  currentInterviewScore: z.number(),
  previousJobDescription: z.string(),
  previousInterviewTranscript: z.string(),
  previousInterviewScore: z.number(),
});

export async function compareInterviewsAction(data: z.infer<typeof compareInterviewsSchema>) {
    const parsed = compareInterviewsSchema.safeParse(data);

    if (!parsed.success) {
        return { status: 'error' as const, message: 'Invalid input for comparison.' };
    }

    try {
        const { comparisonReport, skillScores } = await compareInterviews(parsed.data);
        return { status: 'success' as const, comparisonReport, skillScores: skillScores as SkillScore[] };
    } catch (error) {
        console.error(error);
        return { status: 'error' as const, message: 'Failed to generate comparison. Please try again.' };
    }
}


const gradeResumeSchema = z.object({
  resumeText: z.string(),
});

export async function gradeResumeAction(data: { resumeText: string }) {
  const parsed = gradeResumeSchema.safeParse(data);

  if (!parsed.success) {
    return { status: 'error' as const, message: 'Invalid input for resume grading.' };
  }

  if (parsed.data.resumeText.trim().length === 0) {
    return { status: 'error' as const, message: 'Resume cannot be empty.' };
  }

  try {
    const { score, report } = await gradeResume(parsed.data);
    return { status: 'success' as const, score, report };
  } catch (error) {
    console.error(error);
    return { status: 'error' as const, message: 'Failed to grade resume. Please try again.' };
  }
}
