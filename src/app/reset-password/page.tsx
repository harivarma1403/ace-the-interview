'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCode2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Status = 'loading' | 'valid' | 'invalid' | 'success' | 'submitting';

export default function ResetPasswordPage() {
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [status, setStatus] = useState<Status>('loading');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    const checkCode = async () => {
      if (!oobCode) {
        setStatus('invalid');
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setStatus('valid');
      } catch (error) {
        setStatus('invalid');
        toast({
          variant: 'destructive',
          title: 'Invalid Link',
          description: 'This password reset link is either invalid or has expired. Please try again.',
        });
      }
    };
    checkCode();
  }, [auth, oobCode, toast]);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please ensure both passwords are the same.',
      });
      return;
    }
    if (!oobCode) {
        toast({
            variant: 'destructive',
            title: 'Missing Code',
            description: 'The password reset code is missing. Please use the link from your email.',
        });
        return;
    }

    setStatus('submitting');
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      toast({
        title: 'Success!',
        description: 'Your password has been reset. You can now log in with your new password.',
      });
      setTimeout(() => router.push('/login'), 3000);
    } catch (error: any) {
      setStatus('valid'); // Go back to the form
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to reset password. The link may have expired.',
      });
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Verifying link...</p>
          </div>
        );
      case 'invalid':
        return (
          <div className="flex flex-col items-center justify-center gap-2 text-destructive py-8 text-center">
            <XCircle className="h-8 w-8" />
            <p className="font-semibold">Invalid or Expired Link</p>
            <p className="text-sm">Please return to the forgot password page to request a new link.</p>
             <Button asChild variant="link" className="mt-4">
                <Link href="/forgot-password">Request a new link</Link>
             </Button>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center gap-2 text-green-600 py-8 text-center">
            <CheckCircle className="h-8 w-8" />
            <p className="font-semibold">Password Changed Successfully!</p>
            <p className="text-sm text-muted-foreground">Redirecting you to the login page...</p>
          </div>
        );
      case 'valid':
      case 'submitting':
        return (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={status === 'submitting'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={status === 'submitting'}
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={status === 'submitting'}>
              {status === 'submitting' ? <Loader2 className="animate-spin" /> : 'Reset Password'}
            </Button>
          </form>
        );
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
            <CardTitle className="text-3xl font-bold tracking-tight">Set New Password</CardTitle>
            <CardDescription>
              {status === 'valid' && 'Please enter your new password below.'}
              {status === 'submitting' && 'Updating your password...'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
