'use client';

import { useState, useTransition, FormEvent } from 'react';
import { Bot, BrainCircuit, Loader2, Sparkles, ClipboardCopy, Check, ListChecks } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { startInterviewAction } from '@/lib/actions';
import { Separator } from '../ui/separator';

export default function GenerateQuestions() {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, startGeneratingTransition] = useTransition();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleGenerateQuestions = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const jd = formData.get('jobDescription') as string;

    if (jd.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Job description cannot be empty.',
      });
      return;
    }

    startGeneratingTransition(async () => {
      setQuestions([]);
      const result = await startInterviewAction(formData);
      if (result.status === 'error') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.message,
        });
      } else if (result.questions) {
        setQuestions(result.questions);
      }
    });
  };
  
  const copyToClipboard = () => {
    const allQuestions = questions.join('\n');
    navigator.clipboard.writeText(allQuestions).then(() => {
      setCopied(true);
      toast({
        title: "Copied!",
        description: "The questions have been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BrainCircuit className="text-primary" />
              Generate Interview Questions
            </CardTitle>
            <CardDescription>
              Paste a job description to generate relevant interview questions.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleGenerateQuestions}>
            <CardContent>
              <Textarea
                name="jobDescription"
                placeholder="e.g., Software Engineer at Google"
                className="min-h-[200px] text-base"
                required
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg" disabled={isGenerating}>
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Questions
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <Card className="shadow-lg animate-in fade-in duration-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-2xl">
                <div className="flex items-center gap-2">
                  <ListChecks className="text-primary" />
                  Generated Questions
                </div>
                {questions.length > 0 && (
                   <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                      <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
                   </Button>
                )}
              </CardTitle>
              <CardDescription>
                AI-generated questions will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isGenerating && (
                 <div className="flex flex-col items-center justify-center gap-4 py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating questions...</p>
                 </div>
              )}
              {questions.length > 0 && (
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                      <p className="text-base">{q}</p>
                    </div>
                  ))}
                </div>
              )}
              {!isGenerating && questions.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 text-center text-muted-foreground py-16">
                    <ListChecks className="h-12 w-12" />
                    <p>Your generated questions will be shown here.</p>
                  </div>
              )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
