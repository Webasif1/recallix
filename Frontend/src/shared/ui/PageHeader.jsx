/** Consistent title block for every app view. */
const PageHeader = ({ title, subtitle, actions, icon: Icon }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
    <div className="flex items-start gap-3 min-w-0">
      {Icon && (
        <span className="w-10 h-10 rounded-card bg-accent-soft border border-accent-line flex items-center justify-center shrink-0">
          <Icon className="w-4.5 h-4.5 text-accent" aria-hidden="true" />
        </span>
      )}

      <div className="min-w-0">
        <h1 className="text-h1 font-semibold text-ink truncate">{title}</h1>
        {subtitle && <p className="mt-1 text-base text-muted">{subtitle}</p>}
      </div>
    </div>

    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
