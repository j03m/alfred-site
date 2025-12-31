'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClientRedirect({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [to, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-3xl">A</span>
        </div>
        <h2 className="text-slate-900 font-medium">Loading Alfred...</h2>
        <p className="text-slate-500 text-sm mt-2">Redirecting to {to}</p>
      </div>
    </div>
  );
}
