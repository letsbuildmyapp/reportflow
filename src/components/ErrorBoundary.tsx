import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error('[ReportFlow] uncaught error', err);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}
