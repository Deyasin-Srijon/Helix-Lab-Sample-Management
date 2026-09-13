import { Link, useNavigate } from 'react-router-dom';
import { LogoutIcon, PlusIcon, TableIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Laboratory workspace</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold text-slate-900">
        Welcome, {currentUser?.username}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Track sample intake, status, and updates from a single laboratory console.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link
          to="/add-sample"
          className="group rounded-xl border border-border bg-slate-50 p-5 transition duration-200 hover:border-primary/40 hover:bg-white hover:shadow-sm"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
            <PlusIcon />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-slate-900">Add Sample</h2>
          <p className="mt-1 text-sm text-slate-600">Create a new laboratory sample record.</p>
        </Link>
        <Link
          to="/view-samples"
          className="group rounded-xl border border-border bg-slate-50 p-5 transition duration-200 hover:border-secondary/40 hover:bg-white hover:shadow-sm"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-white">
            <TableIcon />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-slate-900">View Samples</h2>
          <p className="mt-1 text-sm text-slate-600">Filter, page, edit, or delete existing samples.</p>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="group cursor-pointer rounded-xl border border-border bg-slate-50 p-5 text-left transition duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm"
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 text-white">
            <LogoutIcon />
          </span>
          <h2 className="mt-4 font-heading text-lg font-semibold text-slate-900">Logout</h2>
          <p className="mt-1 text-sm text-slate-600">End the current laboratory session.</p>
        </button>
      </div>
    </section>
  );
}
