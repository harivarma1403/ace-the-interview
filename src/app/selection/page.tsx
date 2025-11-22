
'use client';
import Link from 'next/link';
import { Briefcase, GraduationCap, FileCode2, FileScan, LogOut, User, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';


export default function SelectionPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const featureCards = [
    {
      title: 'Interviewer',
      description: 'Generate targeted interview questions.',
      href: '/interviewer',
      icon: Briefcase,
      color: 'text-primary',
      buttonVariant: 'default'
    },
    {
      title: 'Student',
      description: 'Practice with a mock interview.',
      href: '/student',
      icon: GraduationCap,
      color: 'text-accent',
      buttonVariant: 'accent'
    },
    {
      title: 'Resume Grader',
      description: 'Get an ATS score for your resume.',
      href: '/resume-grader',
      icon: FileScan,
      color: 'text-primary',
      buttonVariant: 'default'
    },
    {
      title: 'History',
      description: 'Review your past interview reports.',
      href: '/history',
      icon: History,
      color: 'text-accent',
      buttonVariant: 'accent'
    }
  ];

  return (
    <div
      className="flex flex-col min-h-screen"
      data-ai-hint="background"
    >
        <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b border-primary/20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">Ace the Interview</h1>
              </div>
               <div className="flex items-center gap-4">
                {user && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                )}
                <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl animate-in fade-in slide-in-from-top-4 duration-700">Choose Your Path</h2>
              <p className="mt-4 text-lg text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                Select a tool to start sharpening your interview skills.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
                {featureCards.map((card, index) => (
                  <Card key={card.title} className="shadow-lg hover:shadow-primary/20 transition-all duration-300 bg-card/80 backdrop-blur-sm border-border hover:border-primary/50 animate-in fade-in-0 zoom-in-95" style={{ animationDelay: `${200 * (index + 1)}ms`, animationFillMode: 'backwards' }}>
                    <CardHeader className="items-center text-center p-8">
                      <card.icon className={`h-16 w-16 mb-4 transition-transform group-hover:scale-110 ${card.color}`} />
                      <CardTitle className="text-3xl">{card.title}</CardTitle>
                      <CardDescription>
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center p-8 pt-0">
                      <Button asChild size="lg" className={card.buttonVariant === 'accent' ? "bg-accent hover:bg-accent/90 text-accent-foreground" : ""}>
                        <Link href={card.href}>{card.title === 'Student' ? 'Start Practicing' : 'Get Started'}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="w-full py-4 mt-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
            <p>Built for success</p>
          </div>
        </footer>
    </div>
  );
}
