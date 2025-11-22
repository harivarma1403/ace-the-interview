'use client';

import { useState, useTransition, FormEvent, useRef, ChangeEvent } from 'react';
import { Bot, BrainCircuit, Loader2, Sparkles, FileText, Download, Upload } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfjsLib from 'pdfjs-dist';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { gradeResumeAction } from '@/lib/actions';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`;

export default function ResumeGrader() {
  const [result, setResult] = useState<{ score: number, report: string } | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isGrading, startGradingTransition] = useTransition();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFileName(file.name);
        setResumeText('');
        setResult(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
          if (event.target?.result) {
            try {
              const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
              const pdf = await pdfjsLib.getDocument(typedArray).promise;
              let fullText = '';
              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => 'str' in item ? item.str : '').join(' ');
                fullText += pageText + '\n';
              }
              setResumeText(fullText);
            } catch (error) {
              console.error('Error parsing PDF:', error);
              toast({
                variant: 'destructive',
                title: 'PDF Parsing Error',
                description: 'Could not read the text from the PDF file. Please try another file.',
              });
              setFileName('');
              setResumeText('');
            }
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a .pdf file.',
        });
        setFileName('');
        setResumeText('');
      }
    }
  };

  const handleGradeResume = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (resumeText.trim().length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please upload your resume.',
      });
      return;
    }

    startGradingTransition(async () => {
      setResult(null);
      const actionResult = await gradeResumeAction({ resumeText });
      if (actionResult.status === 'error') {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: actionResult.message,
        });
      } else if (actionResult.score !== undefined && actionResult.report) {
        setResult({ score: actionResult.score, report: actionResult.report });
      }
    });
  };

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
      pdf.save('resume-report.pdf');
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

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="shadow-lg animate-in fade-in duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BrainCircuit className="text-primary" />
              Grade Your Resume
            </CardTitle>
            <CardDescription>
              Upload your resume to get your ATS Score.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleGradeResume}>
            <CardContent className="space-y-4">
               <div>
                <label htmlFor="resumeFile" className="block text-sm font-medium text-foreground mb-2">Upload Resume (.pdf)</label>
                <div 
                  className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    id="resumeFile"
                    name="resumeFile"
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {!fileName ? (
                    <div className="text-center text-muted-foreground">
                      <Upload className="mx-auto h-8 w-8 mb-2" />
                      <p>Click to upload a file</p>
                      <p className="text-xs">Only .pdf files are supported.</p>
                    </div>
                  ) : (
                    <div className="text-center font-medium text-primary">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      <p>{fileName}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg" disabled={isGrading || !resumeText}>
                {isGrading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Get ATS Score
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="animate-in fade-in duration-500">
          {isGrading && (
             <Card className="shadow-lg h-full">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-16 h-full">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="text-muted-foreground">Our AI is analyzing your resume. Please wait...</p>
                </CardContent>
             </Card>
          )}

          {!isGrading && !result && (
              <Card className="shadow-lg h-full">
                <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground gap-2 py-16 h-full">
                  <FileText className="h-12 w-12" />
                  <p>Your resume analysis will appear here.</p>
                </CardContent>
              </Card>
          )}

          {result && (
             <div ref={printableAreaRef} className="printable-area">
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <FileText />
                                    Resume Analysis Report
                                </CardTitle>
                                <CardDescription>Your general resume analysis.</CardDescription>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">ATS Score</p>
                                <p className="text-4xl font-bold text-primary">{result.score.toFixed(0)}<span className="text-lg text-muted-foreground">/100</span></p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Bot /> AI Feedback</h3>
                        <Separator />
                        <div className="mt-4 text-base whitespace-pre-wrap font-body text-foreground/90">
                          {result.report}
                        </div>
                      </div>
                    </CardContent>
                </Card>
            </div>
          )}

          {result && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" onClick={handleDownloadPdf} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download Report
              </Button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
