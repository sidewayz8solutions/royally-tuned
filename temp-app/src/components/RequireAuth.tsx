import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAuth({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (!user) return <>{fallback ?? <div className="p-4 text-gray-400">Please log in to continue.</div>}</>;
  return <>{children}</>;
}

