import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading)
    return (
      <div className="grid place-items-center py-32 text-muted">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
