import { BeakerIcon } from './icons';

export default function AuthCard({ title, subtitle, children }) {
  return (
    <section className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-sm">
          <BeakerIcon />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Helix Lab</p>
          <h1 className="font-heading text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
      </div>
      {subtitle ? <p className="mb-6 text-sm text-slate-600">{subtitle}</p> : null}
      {children}
    </section>
  );
}
