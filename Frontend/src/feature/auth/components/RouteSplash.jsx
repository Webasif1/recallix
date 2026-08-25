import { Sparkle } from "lucide-react";

/**
 * Shown while the session cookie is being verified on boot.
 *
 * Both route guards render this, so a signed-in reload never flashes the
 * landing page before redirecting, and a signed-out visit to /dashboard never
 * flashes an empty app shell.
 */
const RouteSplash = ({ label = "Opening your memory…" }) => (
  <div
    className="min-h-screen bg-canvas flex flex-col items-center justify-center gap-4"
    role="status"
    aria-live="polite"
  >
    <div className="w-11 h-11 rounded-card bg-accent-soft border border-accent-line flex items-center justify-center">
      <Sparkle className="w-5 h-5 text-accent animate-pulse" aria-hidden="true" />
    </div>
    <p className="text-small text-muted">{label}</p>
  </div>
);

export default RouteSplash;
