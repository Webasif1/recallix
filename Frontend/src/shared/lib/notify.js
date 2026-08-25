import { toast } from "sonner";

/**
 * The app's notification surface.
 *
 * Components import THIS, never `sonner` directly, so duration, wording and
 * duplicate handling stay consistent in one place.
 *
 * Passing a stable `id` makes a repeated action (double-clicked delete,
 * retried save) REPLACE its toast instead of stacking a second copy.
 * Convention: "<domain>-<action>-<entity id>", e.g. "item-delete-64ab...".
 */

const DURATION = {
  success: 3000,
  info: 3500,
  warning: 5000,
  error: 6000, // errors need longer to read than confirmations
};

const build = (opts = {}) => ({
  description: opts.description,
  id: opts.id,
  action: opts.action,
  duration: opts.duration,
});

export const notify = {
  success(message, opts = {}) {
    return toast.success(message, {
      ...build(opts),
      duration: opts.duration ?? DURATION.success,
    });
  },

  error(message, opts = {}) {
    return toast.error(message, {
      ...build(opts),
      duration: opts.duration ?? DURATION.error,
    });
  },

  warning(message, opts = {}) {
    return toast.warning(message, {
      ...build(opts),
      duration: opts.duration ?? DURATION.warning,
    });
  },

  info(message, opts = {}) {
    return toast(message, {
      ...build(opts),
      duration: opts.duration ?? DURATION.info,
    });
  },

  /**
   * Tie a toast to a promise: one toast that goes loading -> success | error.
   * Used by the save flow, where the AI round-trip takes several seconds.
   */
  promise(promise, { loading, success, error, id } = {}) {
    return toast.promise(promise, { loading, success, error, id });
  },

  loading(message, opts = {}) {
    return toast.loading(message, build(opts));
  },

  dismiss(id) {
    return toast.dismiss(id);
  },

  dismissAll() {
    return toast.dismiss();
  },
};

export default notify;
