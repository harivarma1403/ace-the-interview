
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCode2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
    const auth = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handlePasswordReset = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            await sendPasswordResetEmail(auth, email);
            // On success (or if user doesn't exist), we show the same message.
        } catch (error: any) {
             // Only show a toast for truly exceptional errors, like a malformed email.
             // We specifically want to avoid telling the user if the email was not found for security reasons.
            if (error.code !== 'auth/user-not-found') {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'The email address is not valid. Please enter a valid email.',
                });
            }
        } finally {
            // This block will always execute, ensuring the UI updates.
            setLoading(false);
            setEmailSent(true);
            toast({
                title: 'Password Reset Email Sent',
                description: `If an account exists for ${email}, you will receive an email with instructions to reset your password.`,
            });
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b border-primary/20 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <FileCode2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Ace the Interview</h1>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-2xl bg-card/80 backdrop-blur-sm border-primary/30 shadow-primary/10 animate-in fade-in duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Forgot Your Password?</CardTitle>
            <CardDescription>
                {emailSent 
                    ? "Check your inbox (and spam folder) for the reset link."
                    : "No problem. Enter your email and we'll send a link to reset your password."
                }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
                <form className="space-y-4" onSubmit={handlePasswordReset}>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={loading} />
                    </div>
                    <Button type="submit" className="w-full h-11" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>
            ) : (
                 <div className="text-center">
                    <p className="text-muted-foreground">Didn't receive the email? Check your spam folder or try submitting the form again.</p>
                </div>
            )}
            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-primary hover:underline flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
