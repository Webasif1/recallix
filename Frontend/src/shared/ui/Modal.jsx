import { useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cx } from "../lib/cx";
import Button from "./Button";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog.
 *
 * Handles the things the old hand-rolled modal did not: Escape to close, focus
 * moved in on open and restored to the trigger on close, focus trapped while
 * open, background scroll locked, and role/aria-modal/aria-labelledby set so
 * screen readers announce it as a dialog.
 */
const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}) => {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }

      if (e.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);

      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // Focus the first control inside the dialog, or the panel itself
    const raf = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    });

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId.current : undefined}
        tabIndex={-1}
        className={cx(
          "relative w-full bg-surface shadow-pop rx-fade-up",
          "rounded-t-modal sm:rounded-modal",
          "max-h-[92vh] flex flex-col outline-none",
          sizes[size],
        )}
      >
        {/* Drag affordance on mobile sheets */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <span className="w-9 h-1 rounded-full bg-line-strong" />
        </div>

        {title && (
          <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:pt-5 pb-4 border-b border-line">
            <div className="min-w-0">
              <h2
                id={titleId.current}
                className="text-h2 font-semibold text-ink"
              >
                {title}
              </h2>
              {description && (
                <p className="mt-1 text-small text-muted">{description}</p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1.5 -mt-1"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        )}

        <div className="px-5 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="px-5 py-4 border-t border-line bg-raised/60 rounded-b-modal">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
