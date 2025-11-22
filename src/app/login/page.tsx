
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileCode2 } from 'lucide-react';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FormEvent, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/selection');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message,
            });
             setLoading(false);
        }
    };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b border-primary/20">
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
              <CardTitle className="text-3xl font-bold tracking-tight">Welcome Back</CardTitle>
              <CardDescription>Sign in to continue to your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                  <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link href="/forgot-password"
                              className="text-sm font-medium text-primary hover:underline">
                              Forgot password?
                          </Link>
                      </div>
                      <Input id="password" name="password" type="password" required disabled={loading} />
                  </div>
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                      {loading ? 'Logging in...' : 'Log In'}
                  </Button>
              </form>
              <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                  Sign up
              </Link>
              </div>
          </CardContent>
          </Card>
      </main>
    </div>
  );
}
