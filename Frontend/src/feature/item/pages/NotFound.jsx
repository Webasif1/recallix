import { Link } from "react-router-dom";
import { Home, Search, Sparkle } from "lucide-react";
import Button from "../../../shared/ui/Button";

/**
 * 404. The old version used Next.js `<style jsx>`, which in Vite/React leaks a
 * `jsx` attribute to the DOM and logs a warning; its keyframes already live in
 * App.css.
 */
const NotFound = () => (
  <div className="min-h-screen bg-canvas flex items-center justify-center px-5 py-16">
    <div className="text-center max-w-md">
      <div className="flex justify-center mb-8" aria-hidden="true">
        <svg
          width="150"
          height="150"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
        >
          <g className="animate-float">
            <rect
              x="58"
              y="70"
              width="84"
              height="104"
              rx="10"
              fill="var(--color-surface)"
              stroke="var(--color-line-strong)"
              strokeWidth="2"
            />
            <line
              x1="74"
              y1="94"
              x2="126"
              y2="94"
              stroke="var(--color-line-strong)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="74"
              y1="110"
              x2="118"
              y2="110"
              stroke="var(--color-line-strong)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="74"
              y1="126"
              x2="108"
              y2="126"
              stroke="var(--color-line-strong)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <text
              x="100"
              y="162"
              textAnchor="middle"
              fill="var(--color-accent)"
              fontSize="26"
              fontWeight="700"
            >
              ?
            </text>
          </g>

          <circle
            cx="132"
            cy="56"
            r="21"
            stroke="var(--color-accent)"
            strokeWidth="3"
            fill="var(--color-accent-soft)"
          />
          <line
            x1="147"
            y1="71"
            x2="166"
            y2="90"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span className="inline-flex items-center gap-1.5 text-caption font-medium text-accent bg-accent-soft border border-accent-line rounded-full px-3 py-1">
        <Sparkle className="w-3 h-3" aria-hidden="true" />
        404
      </span>

      <h1 className="mt-4 text-h1 font-semibold text-ink">
        This page isn't in your memory
      </h1>

      <p className="mt-2 text-base text-muted">
        The link is broken or the page has moved. Nothing you saved is affected.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard">
          <Button variant="primary" size="md" icon={Home} className="w-full sm:w-auto">
            Go to dashboard
          </Button>
        </Link>

        <Link to="/dashboard?view=recall">
          <Button variant="secondary" size="md" icon={Search} className="w-full sm:w-auto">
            Recall something
          </Button>
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
