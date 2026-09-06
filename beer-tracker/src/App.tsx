import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { GroupTotalCard } from './components/GroupTotalCard';
import { Leaderboard } from './components/Leaderboard';
import { SubmissionForm } from './components/SubmissionForm';
import { SubmissionFeed } from './components/SubmissionFeed';
import { useGroupTotal } from './hooks/useGroupTotal';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useSubmissions } from './hooks/useSubmissions';
import { firebaseConfigured } from './lib/firebase';

function Dashboard() {
  const { user } = useAuth();
  const { total } = useGroupTotal();
  const { leaders } = useLeaderboard();
  const { submissions } = useSubmissions();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-12">
      <Header />
      <GroupTotalCard total={total} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SubmissionForm groupTotal={total} />
          <Leaderboard leaders={leaders} currentUid={user?.uid} />
        </div>
        <SubmissionFeed submissions={submissions} />
      </div>
    </div>
  );
}

function ConfigWarning() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center text-amber-100/80">
      <h1 className="mb-3 font-[var(--font-display)] text-2xl font-bold text-amber-400">
        🍺 Beer Tracker needs a Firebase project
      </h1>
      <p className="text-sm">
        Copy <code className="rounded bg-black/30 px-1">.env.example</code> to{' '}
        <code className="rounded bg-black/30 px-1">.env</code>, fill in your Firebase project's config, and
        restart the dev server. See the README for step-by-step setup.
      </p>
    </div>
  );
}

function Gate() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-amber-100/60">Loading…</div>;
  }
  return user ? <Dashboard /> : <AuthScreen />;
}

function App() {
  if (!firebaseConfigured) return <ConfigWarning />;
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}

export default App;
