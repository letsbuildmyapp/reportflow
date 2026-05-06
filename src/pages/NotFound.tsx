import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export function NotFound() {
  return (
    <div className="text-center py-24">
      <div className="size-20 mx-auto rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 grid place-items-center mb-6 shadow-lg shadow-brand-500/30">
        <Compass className="size-10 text-white" />
      </div>
      <h1 className="font-display text-5xl font-extrabold mb-2">404</h1>
      <p className="text-muted mb-8 max-w-md mx-auto leading-relaxed">We couldn't find the page you're looking for. It may have been moved, or never existed.</p>
      <Link to="/" className="btn-primary">Back home</Link>
    </div>
  );
}
