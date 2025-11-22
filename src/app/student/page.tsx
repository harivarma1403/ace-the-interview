import InterviewFlow from "@/components/app/interview-flow";
import { FileCode2 } from "lucide-react";
import Link from "next/link";

export default function StudentPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b border-primary/20 no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/selection" className="flex items-center gap-2">
              <FileCode2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">Ace the Interview</h1>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <InterviewFlow />
      </main>
      <footer className="w-full py-4 mt-auto no-print">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p> Built for success </p>
        </div>
      </footer>
    </div>
  );
}
