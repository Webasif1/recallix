import { Link } from "react-router-dom";
import { Sparkle, Puzzle } from "lucide-react";
import Wordmark from "./Wordmark";

/**
 * Landing footer.
 *
 * Every destination here resolves to a real anchor or route. No href="#"
 * placeholders — that was the exact dead-link bug removed from this page
 * earlier, and Privacy/Terms columns stay out until those pages exist.
 */

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Why Recallix", href: "#problem" },
      { label: "Use cases", href: "#uses" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", to: "/login" },
      { label: "Create account", to: "/register" },
    ],
  },
];

const Footer = () => (
  <footer className="border-t border-line">
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-10">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
        {/* Brand */}
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-control bg-accent flex items-center justify-center">
              <Sparkle className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-h3 font-semibold text-ink tracking-tight">
              Recallix
            </span>
          </div>

          <p className="mt-4 text-small text-muted leading-relaxed">
            Your memory for the web. Save the links you'd otherwise lose, and
            find them again from the little you remember — no folders to
            maintain, no titles to write.
          </p>

          <Link to="/register" className="inline-block mt-5">
            <span className="inline-flex items-center gap-2 text-small font-medium text-accent hover:underline">
              Start saving — it's free
            </span>
          </Link>
        </div>

        {/* Link columns */}
        {COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading}>
            <h2 className="text-caption uppercase tracking-wide font-medium text-faint">
              {column.heading}
            </h2>

            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.to ? (
                    <Link
                      to={link.to}
                      className="text-small text-muted hover:text-ink transition-colors rounded"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-small text-muted hover:text-ink transition-colors rounded"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-12 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-caption text-faint">
          © {new Date().getFullYear()} Recallix
        </p>

        <p className="inline-flex items-center gap-1.5 text-caption text-faint">
          <Puzzle className="w-3.5 h-3.5" aria-hidden="true" />
          Browser extension included
        </p>
      </div>
    </div>

    {/* Full-bleed wordmark, cropped at the viewport edges */}
    <Wordmark className="px-3 sm:px-5 pb-3" />
  </footer>
);

export default Footer;
