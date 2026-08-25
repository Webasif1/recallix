import { Link } from "react-router-dom";
import { Sparkle, ArrowLeft, Search, Bookmark, FolderOpen } from "lucide-react";

/**
 * Split layout for sign in / sign up.
 *
 * Left: the form. Right: a quiet illustration of the actual product — saved
 * links being recalled — so the auth screen still sells what it gates. The
 * panel is decorative and hidden from assistive tech; it collapses below lg.
 */

const SAMPLE = [
  {
    title: "Why React re-renders (and when it matters)",
    domain: "react.dev",
    tags: ["react", "performance"],
    when: "4 months ago",
  },
  {
    title: "MongoDB compound index design",
    domain: "mongodb.com",
    tags: ["database"],
    when: "8 months ago",
  },
  {
    title: "CSS subgrid, practically",
    domain: "web.dev",
    tags: ["css", "layout"],
    when: "last year",
  },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[1fr_1.1fr]">
    {/* ---- Form side ---- */}
    <div className="flex flex-col min-h-screen lg:min-h-0 px-5 sm:px-8 py-8">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 rounded-control"
        >
          <span className="w-8 h-8 rounded-control bg-accent flex items-center justify-center">
            <Sparkle className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-h3 font-semibold text-ink tracking-tight">
            Recallix
          </span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-small text-muted hover:text-ink transition-colors rounded-control px-2 py-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-10">
        <div className="w-full max-w-sm">
          <h1 className="text-h1 font-semibold text-ink">{title}</h1>
          <p className="mt-2 text-base text-muted">{subtitle}</p>

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-small text-muted">{footer}</div>}
        </div>
      </div>
    </div>

    {/* ---- Product panel ---- */}
    <div
      className="hidden lg:flex flex-col justify-center bg-raised border-l border-line px-14 py-16"
      aria-hidden="true"
    >
      <p className="text-caption uppercase font-medium text-muted tracking-wide">
        Recall
      </p>
      <p className="mt-3 text-h1 font-semibold text-ink max-w-md leading-tight">
        “that react article about re-renders”
      </p>

      <div className="mt-8 max-w-md">
        <div className="flex items-center gap-2.5 bg-surface border border-line rounded-control px-3.5 py-3 shadow-card">
          <Search className="w-4 h-4 text-accent shrink-0" />
          <span className="text-small text-body">
            react re-render performance
          </span>
        </div>

        <div className="mt-4 space-y-2.5">
          {SAMPLE.map((item, i) => (
            <div
              key={item.title}
              className="bg-surface border border-line rounded-card p-4 shadow-card"
              style={{ opacity: 1 - i * 0.22 }}
            >
              {i === 0 && (
                <span className="inline-flex items-center gap-1 text-caption font-medium text-accent bg-accent-soft border border-accent-line rounded-full px-2 py-0.5 mb-2">
                  Best match
                </span>
              )}

              <p className="text-small font-semibold text-ink leading-snug">
                {item.title}
              </p>

              <div className="mt-2 flex items-center gap-2 text-caption text-muted">
                <FolderOpen className="w-3 h-3" />
                <span>{item.domain}</span>
                <span>·</span>
                <span>saved {item.when}</span>
              </div>

              <div className="mt-2.5 flex gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-caption text-body bg-raised border border-line rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 flex items-center gap-2 text-small text-muted">
          <Bookmark className="w-4 h-4 text-accent" />
          Saved once. Found in seconds.
        </p>
      </div>
    </div>
  </div>
);

export default AuthLayout;
