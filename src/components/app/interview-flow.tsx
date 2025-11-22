
'use client';

import { useState, useTransition, FormEvent, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Bot, BrainCircuit, Download, Loader2, PartyPopper, Sparkles, User, FileText, Video, Camera, Mic, Square, RefreshCcw, CheckCircle, Scale, History } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { compareInterviewsAction, getFeedbackAction, startInterviewAction, transcribeAudioAction } from '@/lib/actions';
import { Separator } from '../ui/separator';
import { ProgressChart } from './progress-chart';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type Stage = 'start' | 'interviewing' | 'evaluating' | 'feedback';

interface Answer {
  question: string;
  answer: string;
  isSubmitted: boolean;
}

export interface SkillScore {
  skill: string;
  previousScore: number;
  currentScore: number;
}

export interface InterviewRecord {
  jobDescription: string;
  interviewTranscript: string;
  feedbackReport: string;
  score: number;
  answers: Answer[];
  completedAt: string;
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'done';

export default function InterviewFlow() {
  const [stage, setStage] = useState<Stage>('start');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [feedbackReport, setFeedbackReport] = useState('');
  const [interviewScore, setInterviewScore] = useState(0);
  const [comparisonReport, setComparisonReport] = useState('');
  const [skillScores, setSkillScores] = useState<SkillScore[]>([]);
  
  const { toast } = useToast();
  const [isStarting, startStartingTransition] = useTransition();
  const [isEvaluating, startEvaluatingTransition] = useTransition();

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isTranscribing, startTranscribingTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const handleAnswerChange = useCallback((text: string) => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      if (newAnswers[currentQuestionIndex]) {
        newAnswers[currentQuestionIndex].answer = text;
      }
      return newAnswers;
    });
  }, [currentQuestionIndex]);
  
  const handleTranscription = useCallback((audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      setRecordingState('idle');
      toast({
        variant: 'destructive',
        title: 'Recording Failed',
        description: 'No audio was recorded. Please check your microphone.',
      });
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64Audio = reader.result as string;
      
      startTranscribingTransition(async () => {
        const result = await transcribeAudioAction({ audioDataUri: base64Audio });
        if (result.status === 'success') {
          handleAnswerChange(result.transcript);
          setRecordingState('done');
        } else {
          toast({
            variant: 'destructive',
            title: 'Transcription Failed',
            description: result.message,
          });
          setRecordingState('idle');
        }
      });
    };
  }, [toast, handleAnswerChange]);

  const setupMediaRecorder = useCallback((stream: MediaStream) => {
    try {
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
         handleTranscription(audioBlob);
         audioChunksRef.current = [];
      };
    } catch (e) {
      console.error("Error setting up media recorder:", e);
      toast({
        variant: 'destructive',
        title: 'Recording Error',
        description: 'Could not set up the audio recorder.',
      });
    }
  }, [handleTranscription, toast]);
  
  useEffect(() => {
    const setupMedia = async () => {
      if (stage === 'interviewing') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setHasCameraPermission(true);
          mediaStreamRef.current = stream;
  
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          
          setupMediaRecorder(stream);

        } catch (error) {
          console.error('Error accessing media devices:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Media Access Denied',
            description: 'Please enable camera and microphone permissions in your browser settings.',
          });
        }
      } else {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      }
    };
  
    setupMedia();

    return () => {
       if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [stage, toast, setupMediaRecorder]);


  const handleStartInterview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jd = formData.get('jobDescription') as string;

    startStartingTransition(async () => {
      setJobDescription(jd);
      const result = await startInterviewAction(formData);
      if (result.status === 'error') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else if (result.questions) {
        setQuestions(result.questions);
        setAnswers(result.questions.map(q => ({ question: q, answer: '', isSubmitted: false })));
        setCurrentQuestionIndex(0);
        setStage('interviewing');
      }
    });
  };

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      if (recordingState === 'recording' || recordingState === 'processing' || isTranscribing) {
        toast({
          title: "Recording in Progress",
          description: "Please stop recording before changing questions.",
        });
        return;
      }
      setCurrentQuestionIndex(index);
      setRecordingState('idle');
      if (mediaStreamRef.current) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setupMediaRecorder(mediaStreamRef.current);
      }
    }
  }, [questions.length, recordingState, isTranscribing, toast, setupMediaRecorder]);

  const submitCurrentAnswer = () => {
     setAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers];
        newAnswers[currentQuestionIndex].isSubmitted = true;
        return newAnswers;
    });
    if (currentQuestionIndex < questions.length - 1) {
        goToQuestion(currentQuestionIndex + 1);
    } else {
        toast({
            title: "Last Question Submitted",
            description: "You can now finish the interview to get your feedback.",
        });
    }
  }


  const handleGetFeedback = () => {
    const allAnswersSubmitted = answers.every(a => a.isSubmitted);
    if (!allAnswersSubmitted) {
      toast({
        variant: 'destructive',
        title: 'Interview Not Complete',
        description: 'Please submit all your answers before getting feedback.',
      });
      return;
    }
    
    setStage('evaluating');
    const interviewTranscript = answers
      .map(a => `Question: ${a.question}\nAnswer: ${a.answer}`)
      .join('\n\n');

    startEvaluatingTransition(async () => {
      const feedbackResult = await getFeedbackAction({ jobDescription, interviewTranscript });
      
      if (feedbackResult.status === 'error') {
        toast({
          variant: 'destructive',
          title: 'Error generating feedback',
          description: feedbackResult.message,
        });
        setStage('interviewing');
        return;
      }
      
      setFeedbackReport(feedbackResult.feedbackReport!);
      setInterviewScore(feedbackResult.score || 0);

      const previousInterviewHistory = localStorage.getItem('interviewHistory');
      const previousInterviews: InterviewRecord[] = previousInterviewHistory ? JSON.parse(previousInterviewHistory) : [];
      const lastInterview = previousInterviews[0];

      if (lastInterview) {
        const comparisonResult = await compareInterviewsAction({
          currentJobDescription: jobDescription,
          currentInterviewTranscript: interviewTranscript,
          currentInterviewScore: feedbackResult.score || 0,
          previousJobDescription: lastInterview.jobDescription,
          previousInterviewTranscript: lastInterview.interviewTranscript,
          previousInterviewScore: lastInterview.score
        });

        if (comparisonResult.status === 'success' && comparisonResult.comparisonReport) {
          setComparisonReport(comparisonResult.comparisonReport);
          setSkillScores(comparisonResult.skillScores || []);
        }
      }
      
      const newInterviewRecord: InterviewRecord = {
        jobDescription,
        interviewTranscript,
        feedbackReport: feedbackResult.feedbackReport!,
        score: feedbackResult.score || 0,
        answers: answers.map(({ question, answer }) => ({ question, answer, isSubmitted: true })),
        completedAt: new Date().toISOString(),
      };
      
      previousInterviews.unshift(newInterviewRecord);
      localStorage.setItem('interviewHistory', JSON.stringify(previousInterviews.slice(0, 5)));

      setStage('feedback');
    });
  };
  
  const startNewInterview = () => {
    setStage('start');
    setJobDescription('');
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setFeedbackReport('');
    setInterviewScore(0);
    setRecordingState('idle');
    setComparisonReport('');
    setSkillScores([]);
  };

  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingState('processing');
    }
  };

  const resetRecording = () => {
    handleAnswerChange('');
    setRecordingState('idle');
  }

  const handleDownloadPdf = async () => {
    const element = printableAreaRef.current;
    if (!element) {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'Could not find the report content.',
      });
      return;
    }

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
      });

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('feedback-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'An error occurred while generating the PDF.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const renderRecordingControls = () => {
    const isLoading = isTranscribing || recordingState === 'processing';
    const currentAnswerData = answers[currentQuestionIndex];
    const currentAnswer = currentAnswerData?.answer || '';
    const isSubmitted = currentAnswerData?.isSubmitted;
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    if (isSubmitted) {
        return (
            <div className="mt-4 flex flex-col items-center gap-4">
                <Textarea
                    placeholder="Your transcribed answer will appear here."
                    className="min-h-[150px] text-base bg-muted/40"
                    value={currentAnswer}
                    readOnly
                />
                <div className="flex items-center gap-2 text-green-600 font-medium p-3 bg-green-50 rounded-lg">
                    <CheckCircle />
                    Answer Submitted
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col items-center gap-4">
            <Textarea
                placeholder="Your transcribed answer will appear here."
                className="min-h-[150px] text-base bg-muted/40"
                value={isLoading ? 'Processing...' : currentAnswer}
                readOnly={isLoading || recordingState !== 'idle'}
                onChange={(e) => handleAnswerChange(e.target.value)}
            />
            <div className="flex items-center gap-3">
                {recordingState === 'idle' && (
                    <Button onClick={startRecording} size="lg" className="gap-2">
                        <Mic /> Record Answer
                    </Button>
                )}
                {recordingState === 'recording' && (
                    <Button onClick={stopRecording} size="lg" variant="destructive" className="gap-2">
                        <Square /> Stop Recording
                    </Button>
                )}
                {(recordingState === 'processing' || isTranscribing) && (
                    <Button size="lg" disabled className="gap-2">
                        <Loader2 className="animate-spin" /> Processing...
                    </Button>
                )}
                 {recordingState === 'done' && (
                    <>
                      <Button onClick={resetRecording} variant="outline" size="lg" className="gap-2">
                          <RefreshCcw /> Re-record
                      </Button>
                      {isLastQuestion ? (
                        <Button onClick={submitCurrentAnswer} size="lg" className="gap-2">
                            Submit Answer
                        </Button>
                      ) : (
                        <Button onClick={submitCurrentAnswer} size="lg" className="gap-2">
                            Submit & Next <ArrowRight />
                        </Button>
                      )}
                    </>
                )}
            </div>
        </div>
    );
  };

  if (stage === 'start') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-2xl mx-auto shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BrainCircuit className="text-primary" />
              Your Personal Interview Coach
            </CardTitle>
            <CardDescription>
              Paste a job description below to start your AI-powered mock interview. The interview will use your camera and microphone.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleStartInterview}>
            <CardContent>
              <Textarea
                name="jobDescription"
                placeholder="e.g.,Software Enginer, Front-End Developer..."
                className="min-h-[200px] text-base"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg" disabled={isStarting}>
                {isStarting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Start Video Interview
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  if (stage === 'interviewing') {
    const allAnswersSubmitted = answers.every(a => a.isSubmitted);
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
            <Card className="shadow-lg animate-in fade-in duration-500 md:col-span-3">
                <CardHeader>
                    <p className="text-sm font-medium text-primary">Question {currentQuestionIndex + 1} of {questions.length}</p>
                    <CardTitle className="text-2xl">{questions[currentQuestionIndex]}</CardTitle>
                    <Progress value={((answers.filter(a => a.isSubmitted).length) / questions.length) * 100} className="mt-4" />
                </CardHeader>
                <CardContent>
                    {renderRecordingControls()}
                </CardContent>
            </Card>

            <div className="space-y-4 md:col-span-2">
                <Card className="shadow-lg animate-in fade-in duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Camera className="text-primary"/>
                            Your Video
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {hasCameraPermission === null && (
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground p-8 aspect-video">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p>Requesting camera access...</p>
                            </div>
                        )}
                        <div className="relative aspect-video">
                          <video ref={videoRef} className="w-full h-full rounded-md bg-muted object-cover" autoPlay muted />
                          {hasCameraPermission === false && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-md p-4 text-center">
                               <Alert variant="destructive">
                                  <AlertTitle>Camera Access Denied</AlertTitle>
                                  <AlertDescription>
                                    Please enable camera and microphone permissions in your browser settings to continue.
                                  </AlertDescription>
                                </Alert>
                            </div>
                          )}
                        </div>
                    </CardContent>
                </Card>
                <div className="flex justify-between p-1">
                    <Button variant="outline" onClick={() => goToQuestion(currentQuestionIndex - 1)} disabled={currentQuestionIndex === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                     <Button 
                        onClick={handleGetFeedback} 
                        className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={!allAnswersSubmitted}
                    >
                        <PartyPopper className="mr-2 h-4 w-4" /> Finish & Get Feedback
                    </Button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (stage === 'evaluating') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="max-w-md mx-auto shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="text-center">Evaluating Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground text-center">Our AI is analyzing your responses. Please wait a moment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (stage === 'feedback') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start mb-6 no-print">
            <div>
              <h2 className="text-3xl font-bold">Your Feedback Report</h2>
              <p className="text-muted-foreground">Here's the detailed analysis of your interview performance.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download PDF
              </Button>
              <Button onClick={startNewInterview}>
                Start New Interview
              </Button>
            </div>
          </div>
          
          <div ref={printableAreaRef} className="printable-area bg-card p-6 sm:p-8 rounded-lg">
            <Card className="shadow-none border-none">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <FileText />
                                Interview Performance Analysis
                            </CardTitle>
                            <CardDescription>Based on the job description you provided.</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Overall Score</p>
                            <p className="text-4xl font-bold text-primary">{interviewScore.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span></p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {comparisonReport && skillScores.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Scale /> Progress Analysis</h3>
                      <Separator />
                      <div className="mt-4">
                        <ProgressChart data={skillScores} />
                        <div className="mt-4 text-base whitespace-pre-wrap font-body text-foreground/90">
                          {comparisonReport}
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bot /> AI Feedback</h3>
                    <Separator />
                    <div className="mt-4 text-base whitespace-pre-wrap font-body text-foreground/90">
                      {feedbackReport}
                    </div>
                  </div>

                  <div className="pt-4">
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><User /> Your Answers</h3>
                      <Separator />
                      <div className="mt-4 space-y-4">
                        {answers.map((a, i) => (
                          <div key={i}>
                              <p className="font-semibold text-primary">{`Question ${i+1}: ${a.question}`}</p>
                              <p className="pl-4 mt-1 text-muted-foreground italic border-l-2 ml-2">{a.answer || "No answer provided."}</p>
                          </div>
                        ))}
                      </div>
                  </div>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return null;
}
