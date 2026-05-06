import { Link } from 'react-router-dom';
import { AlertOctagon } from 'lucide-react';

export function ServerError() {
  return (
    <div className="text-center py-24">
      <div className="size-20 mx-auto rounded-3xl bg-gradient-to-br from-red-500 to-amber-500 grid place-items-center mb-6 shadow-lg shadow-red-500/30">
        <AlertOctagon className="size-10 text-white" />
      </div>
      <h1 className="font-display text-5xl font-extrabold mb-2">500</h1>
      <p className="text-muted mb-8 max-w-md mx-auto leading-relaxed">Something went wrong on our end. We've logged the error — try refreshing.</p>
      <div className="flex justify-center gap-3">
        <button onClick={() => location.reload()} className="btn-secondary">Refresh</button>
        <Link to="/" className="btn-primary">Back home</Link>
      </div>
    </div>
  );
}
