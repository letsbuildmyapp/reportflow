import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Protected } from './components/Protected';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NewReport } from './pages/NewReport';
import { ReportDetail } from './pages/ReportDetail';
import { NotFound } from './pages/NotFound';
import { ServerError } from './pages/ServerError';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Tutorial } from './components/Tutorial';

export default function App() {
  return (
    <ErrorBoundary fallback={<ServerError />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="new" element={<Protected><NewReport /></Protected>} />
          <Route path="report/:id" element={<Protected><ReportDetail /></Protected>} />
          <Route path="500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Tutorial />
    </ErrorBoundary>
  );
}
