import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from './Button';
import { BeakerIcon, LogoutIcon } from './icons';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/add-sample', label: 'Add Sample' },
  { to: '/view-samples', label: 'View Samples' },
];

export default function AppShell({ children }) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        Skip to main content
      </a>
      <header className="border-b border-border bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary text-white">
              <BeakerIcon className="h-5 w-5" />
            </span>
            <span className="font-heading text-lg font-semibold">Helix Lab</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                    isActive ? 'bg-muted text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{currentUser?.username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogoutIcon className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-3 md:hidden" aria-label="Mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-muted text-primary' : 'text-slate-600'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
