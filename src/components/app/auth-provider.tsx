
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
const PUBLIC_ROUTES = ['/']; 

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; 

    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (user && (isAuthRoute || pathname === '/')) {
      router.push('/selection');
    }

    if (!user && !isAuthRoute && !isPublicRoute) {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
