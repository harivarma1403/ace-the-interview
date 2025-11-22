
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, History, Bot, User } from 'lucide-react';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';
import type { InterviewRecord } from './interview-flow';

export default function InterviewHistory() {
    const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const historyData = localStorage.getItem('interviewHistory');
        if (historyData) {
            setInterviews(JSON.parse(historyData));
        }
        setLoading(false);
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            );
        }

        if (interviews.length === 0) {
            return (
                <Card className="max-w-md mx-auto mt-8">
                    <CardHeader className="items-center text-center">
                        <History className="h-12 w-12 mx-auto text-muted-foreground" />
                        <CardTitle className="mt-4">No History Found</CardTitle>
                        <CardDescription>Complete a mock interview to see your history here.</CardDescription>
                    </CardHeader>
                </Card>
            );
        }
        
        return (
            <Accordion type="single" collapsible className="w-full space-y-4 mt-8 max-w-4xl mx-auto">
                {interviews.map((interview, index) => (
                    <AccordionItem value={`item-${index}`} key={index} className="bg-card border rounded-lg">
                        <AccordionTrigger className="p-6 hover:no-underline">
                           <div className="flex justify-between w-full items-center">
                                <div>
                                    <p className="font-semibold text-lg text-primary">
                                        {`Interview from ${format(new Date(interview.completedAt), 'PPP')}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground text-left">{interview.jobDescription.substring(0, 100)}...</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">Overall Score</p>
                                    <p className="text-2xl font-bold text-primary">{interview.score.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
                                </div>
                           </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 pt-0">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bot /> AI Feedback</h3>
                                    <Separator />
                                    <div className="mt-4 text-base whitespace-pre-wrap font-body text-foreground/90">
                                        {interview.feedbackReport}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><User /> Your Answers</h3>
                                    <Separator />
                                    <div className="mt-4 space-y-4">
                                        {interview.answers.map((a, i) => (
                                        <div key={i}>
                                            <p className="font-semibold text-primary">{`Question ${i+1}: ${a.question}`}</p>
                                            <p className="pl-4 mt-1 text-muted-foreground italic border-l-2 ml-2">{a.answer || "No answer provided."}</p>
                                        </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-3xl font-bold mb-2 text-center">Interview History</h2>
            <p className="text-muted-foreground text-center mb-6">Review your past interview results and track your progress.</p>
            
            {renderContent()}
        </div>
    );
}
