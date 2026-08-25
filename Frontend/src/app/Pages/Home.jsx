import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkle,
  ArrowRight,
  Search,
  FolderOpen,
  Bookmark,
  Menu,
  X,
  MessageSquareDashed,
  FolderX,
  Timer,
  GraduationCap,
  Code2,
  Palette,
  Microscope,
} from "lucide-react";
import RecallDemo from "../../feature/marketing/components/RecallDemo";
import Button from "../../shared/ui/Button";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#problem", label: "Why" },
  { href: "#uses", label: "Use cases" },
];

const FRUSTRATIONS = [
  {
    icon: FolderX,
    title: "Bookmarks are a graveyard",
    body: "Nine hundred of them in folders you named once and never opened again.",
  },
  {
    icon: MessageSquareDashed,
    title: "Links die in chat threads",
    body: "You sent it to yourself on Slack. It's somewhere above four months of messages.",
  },
  {
    icon: Timer,
    title: "You remember the idea, not the source",
    body: "Something about database indexes. A good post. No idea where.",
  },
];

const STEPS = [
  {
    icon: Bookmark,
    title: "Save",
    body: "Paste a link. That's the whole interaction — no title to write, no folder to choose.",
  },
  {
    icon: FolderOpen,
    title: "Organise",
    body: "Recallix reads the page, writes a short summary, picks the tags and files it into a topic.",
  },
  {
    icon: Search,
    title: "Recall",
    body: "Describe what you half-remember. It matches on meaning, not on the exact words you typed.",
  },
];

const USE_CASES = [
  {
    icon: Code2,
    title: "Developers",
    body: "The Stack Overflow answer, the migration guide, the config that finally worked.",
  },
  {
    icon: GraduationCap,
    title: "Learners",
    body: "Courses, papers and threads worth coming back to when the topic finally clicks.",
  },
  {
    icon: Palette,
    title: "Designers",
    body: "References and patterns you'll want the moment a similar problem appears.",
  },
  {
    icon: Microscope,
    title: "Researchers",
    body: "Sources you must be able to find again, months after you first read them.",
  },
];

const Section = ({ id, children, className = "" }) => (
  <section id={id} className={`px-5 sm:px-8 py-16 md:py-24 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </section>
);

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-surface focus:border focus:border-line focus:rounded-control focus:px-4 focus:py-2 focus:text-small"
      >
        Skip to content
      </a>

      {/* ---- Nav ---- */}
      <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur border-b border-line">
        <nav
          aria-label="Main"
          className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4"
        >
          <Link to="/" className="flex items-center gap-2.5 rounded-control">
            <span className="w-8 h-8 rounded-control bg-accent flex items-center justify-center">
              <Sparkle className="w-4 h-4 text-white" aria-hidden="true" />
            </span>
            <span className="text-h3 font-semibold text-ink tracking-tight">
              Recallix
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-control text-small text-muted hover:text-ink hover:bg-raised transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </Button>
        </nav>

        {menuOpen && (
          <div className="md:hidden border-t border-line bg-surface px-5 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-control text-small text-body hover:bg-raised"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link to="/login">
                <Button variant="secondary" size="md" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="md" className="w-full">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        {/* ---- Hero ---- */}
        <Section className="pt-14 md:pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 text-caption font-medium text-accent bg-accent-soft border border-accent-line rounded-full px-3 py-1">
                <Sparkle className="w-3 h-3" aria-hidden="true" />
                Your memory for the web
              </span>

              <h1 className="mt-5 text-display font-bold text-ink">
                Save it now.
                <br />
                Recall it later.
              </h1>

              <p className="mt-5 text-lg text-muted max-w-lg leading-relaxed">
                Recallix keeps the links you'd otherwise lose — and finds them
                again from the little you remember. No folders to maintain, no
                titles to write.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    iconRight={ArrowRight}
                    className="w-full sm:w-auto"
                  >
                    Start saving
                  </Button>
                </Link>

                <a href="#how">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    See how it works
                  </Button>
                </a>
              </div>

              <p className="mt-4 text-small text-faint">
                Free to start · No credit card
              </p>
            </div>

            <RecallDemo />
          </div>
        </Section>

        {/* ---- Problem ---- */}
        <Section id="problem" className="border-t border-line bg-surface">
          <div className="max-w-2xl">
            <h2 className="text-h1 font-semibold text-ink">
              You already saved it. That was never the problem.
            </h2>
            <p className="mt-3 text-lg text-muted">
              The problem is finding it four months later, when you only
              remember what it was about.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {FRUSTRATIONS.map((item) => (
              <div
                key={item.title}
                className="bg-canvas border border-line rounded-card p-5"
              >
                <span className="w-9 h-9 rounded-control bg-raised border border-line flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-muted" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-h3 font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-small text-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- How it works ---- */}
        <Section id="how" className="border-t border-line">
          <div className="max-w-2xl">
            <h2 className="text-h1 font-semibold text-ink">
              Three steps, and you only do the first one
            </h2>
            <p className="mt-3 text-lg text-muted">
              Everything after the paste happens without you.
            </p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="bg-surface border border-line rounded-card p-6 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-control bg-accent-soft border border-accent-line flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-accent" aria-hidden="true" />
                  </span>
                  <span className="text-caption font-medium text-faint tabular-nums">
                    0{i + 1}
                  </span>
                </div>

                <h3 className="mt-4 text-h2 font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-small text-muted leading-relaxed">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- Use cases ---- */}
        <Section id="uses" className="border-t border-line bg-surface">
          <div className="max-w-2xl">
            <h2 className="text-h1 font-semibold text-ink">
              For anyone who reads more than they can remember
            </h2>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {USE_CASES.map((item) => (
              <div
                key={item.title}
                className="bg-canvas border border-line rounded-card p-5"
              >
                <item.icon className="w-5 h-5 text-accent" aria-hidden="true" />
                <h3 className="mt-3 text-h3 font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-small text-muted leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- CTA ---- */}
        <Section className="border-t border-line">
          <div className="bg-ink rounded-modal px-6 sm:px-12 py-14 text-center">
            <h2 className="text-h1 sm:text-display font-bold text-white max-w-2xl mx-auto leading-tight">
              Stop losing things worth keeping
            </h2>

            <p className="mt-4 text-base text-white/70 max-w-md mx-auto">
              Save your first link in about ten seconds. Find it again in two.
            </p>

            <Link to="/register" className="inline-block mt-8">
              <Button variant="primary" size="lg" iconRight={ArrowRight}>
                Start saving
              </Button>
            </Link>
          </div>
        </Section>
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-line px-5 sm:px-8 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-control bg-accent flex items-center justify-center">
              <Sparkle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            </span>
            <span className="text-small font-semibold text-ink">Recallix</span>
          </div>

          <nav aria-label="Footer" className="flex items-center gap-5">
            <a
              href="#how"
              className="text-small text-muted hover:text-ink transition-colors"
            >
              How it works
            </a>
            <Link
              to="/login"
              className="text-small text-muted hover:text-ink transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-small text-muted hover:text-ink transition-colors"
            >
              Get started
            </Link>
          </nav>

          <p className="text-caption text-faint">
            © {new Date().getFullYear()} Recallix
          </p>
        </div>
      </footer>
    </div>
  );
}
