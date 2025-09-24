'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import InfinityLoader from '@/components/infinity-loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <InfinityLoader size={128} />
      </div>
    );
  }

  if (!user) {
    router.push('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}