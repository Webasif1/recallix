import { useEffect, useRef, useState } from "react";
import { Search, Sparkle, Check, Clock, ExternalLink } from "lucide-react";
import { cx } from "../../../shared/lib/cx";

/**
 * The hero visual: the product loop, played out in real product chrome.
 *
 * found it -> saved it -> tagged -> forgotten -> asked for it -> found again
 *
 * Autoplays once, is scrubbable by clicking a step, and under
 * prefers-reduced-motion it jumps straight to the final beat instead of
 * animating (every step's content is still reachable by clicking).
 */

const STEPS = [
  { id: "found", label: "You find something good" },
  { id: "saved", label: "Save it to Recallix" },
  { id: "organised", label: "It files itself" },
  { id: "forgot", label: "You forget all about it" },
  { id: "recall", label: "Months later, you ask" },
  { id: "found-again", label: "There it is" },
];

const ARTICLE = {
  title: "Why your React app re-renders more than you think",
  domain: "react.dev",
  tags: ["react", "performance", "frontend"],
  collection: "Frontend",
};

const STEP_MS = 2200;

const RecallDemo = () => {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduced) {
      setPlaying(false);
      setStep(STEPS.length - 1);
      return;
    }
  }, []);

  useEffect(() => {
    if (!playing) return;

    timerRef.current = setTimeout(() => {
      setStep((current) => {
        if (current >= STEPS.length - 1) {
          setPlaying(false); // plays once; the user drives from here
          return current;
        }
        return current + 1;
      });
    }, STEP_MS);

    return () => clearTimeout(timerRef.current);
  }, [step, playing]);

  const goTo = (index) => {
    setPlaying(false);
    clearTimeout(timerRef.current);
    setStep(index);
  };

  const atLeast = (id) => step >= STEPS.findIndex((s) => s.id === id);
  const isRecalling = step >= 4;

  return (
    <div className="w-full">
      {/* Product frame */}
      <div className="bg-surface border border-line rounded-modal shadow-pop overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-raised/60">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
            <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
          </span>
          <span className="ml-2 text-caption text-muted">Recallix</span>
        </div>

        <div className="p-5 sm:p-6 min-h-[320px] sm:min-h-[340px]">
          {!isRecalling ? (
            <>
              {/* Save bar */}
              <div
                className={cx(
                  "flex items-center gap-2.5 border rounded-control px-3.5 py-3 transition-colors duration-500",
                  atLeast("saved")
                    ? "border-accent-line bg-accent-soft"
                    : "border-line bg-surface",
                )}
              >
                {atLeast("saved") ? (
                  <Check className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                ) : (
                  <Sparkle className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />
                )}

                <span className="text-small text-body truncate">
                  {ARTICLE.domain}/learn/render-and-commit
                </span>

                {atLeast("saved") && (
                  <span className="ml-auto text-caption font-medium text-accent shrink-0">
                    Saved
                  </span>
                )}
              </div>

              {/* The saved card assembling itself */}
              <div
                className={cx(
                  "mt-4 border border-line rounded-card p-4 transition-all duration-500",
                  atLeast("saved")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2",
                )}
              >
                <p className="text-h3 font-semibold text-ink leading-snug">
                  {ARTICLE.title}
                </p>
                <p className="mt-1 text-caption text-muted">{ARTICLE.domain}</p>

                <div
                  className={cx(
                    "mt-3 flex flex-wrap items-center gap-1.5 transition-opacity duration-500",
                    atLeast("organised") ? "opacity-100" : "opacity-0",
                  )}
                >
                  <span className="text-caption font-medium text-accent bg-accent-soft border border-accent-line rounded-full px-2 py-0.5">
                    {ARTICLE.collection}
                  </span>

                  {ARTICLE.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-caption text-body bg-raised border border-line rounded-full px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {atLeast("organised") && (
                <p className="mt-3 text-caption text-muted rx-fade-up">
                  Summary written, tags picked, filed under{" "}
                  {ARTICLE.collection} — automatically.
                </p>
              )}

              {atLeast("forgot") && (
                <div className="mt-5 flex items-center gap-2 text-small text-faint rx-fade-up">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  Four months pass. You forget you ever saved it.
                </div>
              )}
            </>
          ) : (
            <>
              {/* Recall */}
              <div className="flex items-center gap-2.5 border border-accent-line bg-surface rounded-control px-3.5 py-3 shadow-card">
                <Search className="w-4 h-4 text-accent shrink-0" aria-hidden="true" />
                <span className="text-small text-ink">
                  that react thing about re-rendering
                </span>
              </div>

              <p className="mt-4 text-caption uppercase tracking-wide font-medium text-muted">
                Best match
              </p>

              <div
                className={cx(
                  "mt-2 border rounded-card p-4 transition-all duration-500",
                  step >= 5
                    ? "border-accent-line ring-1 ring-accent/15 opacity-100 translate-y-0"
                    : "border-line opacity-40 translate-y-2",
                )}
              >
                <p className="text-h3 font-semibold text-ink leading-snug">
                  {ARTICLE.title}
                </p>

                <p className="mt-1.5 text-caption text-muted">
                  {ARTICLE.domain} · saved 4 months ago · {ARTICLE.collection}
                </p>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {ARTICLE.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-caption text-body bg-raised border border-line rounded-full px-2 py-0.5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {step >= 5 && (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-small font-medium text-accent">
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    Open it again
                  </span>
                )}
              </div>

              {step >= 5 && (
                <p className="mt-4 text-small text-muted rx-fade-up">
                  You never typed the title. You didn't have to.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Step rail — doubles as the scrubber */}
      <ol className="mt-5 flex flex-wrap gap-1.5" aria-label="How Recallix works">
        {STEPS.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => goTo(i)}
              aria-current={i === step ? "step" : undefined}
              className={cx(
                "text-caption px-2.5 py-1.5 rounded-full border transition-colors",
                i === step
                  ? "bg-accent text-white border-accent"
                  : i < step
                    ? "bg-accent-soft text-accent border-accent-line"
                    : "bg-surface text-muted border-line hover:border-line-strong",
              )}
            >
              {s.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default RecallDemo;
