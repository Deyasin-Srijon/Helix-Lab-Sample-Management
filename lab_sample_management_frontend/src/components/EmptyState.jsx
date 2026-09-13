export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white/70 px-6 py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.75" />
          <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </div>
      <h3 className="font-heading text-lg font-semibold text-slate-900">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}
