import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItem, deleteItem } from "../item.slice";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import notify from "../../../shared/lib/notify";

/**
 * Save + delete, in one place.
 *
 * Every view used to repeat the same window.confirm / dispatch / toast block,
 * and they had drifted (one called an undefined handler, one had no confirm at
 * all). Views now call `requestDelete(item)` and render `confirmDialog`.
 *
 * Toast ids are keyed by item so a double-click replaces the toast rather than
 * stacking two of them.
 */
export function useItemActions() {
  const dispatch = useDispatch();
  const deletingIds = useSelector((state) => state.items.deletingIds);
  const [pending, setPending] = useState(null);

  const requestDelete = useCallback((item) => setPending(item), []);
  const cancelDelete = useCallback(() => setPending(null), []);

  const confirmDelete = useCallback(async () => {
    if (!pending) return;

    const { _id, title } = pending;
    const label = title || "This link";

    try {
      await dispatch(deleteItem(_id)).unwrap();

      notify.success("Removed from your memory", {
        description: label,
        id: `item-delete-${_id}`,
      });
    } catch (message) {
      notify.error("Couldn't delete that", {
        description: String(message),
        id: `item-delete-${_id}`,
      });
    } finally {
      setPending(null);
    }
  }, [dispatch, pending]);

  /**
   * Save a link. Resolves true on success so callers can close their modal.
   * The AI round-trip is slow, hence a promise toast rather than a silent wait.
   */
  const save = useCallback(
    async (url) => {
      const trimmed = url?.trim();

      if (!trimmed) {
        notify.error("Paste a link first", { id: "item-save" });
        return false;
      }

      const request = dispatch(addItem(trimmed)).unwrap();

      notify.promise(request, {
        id: "item-save",
        loading: "Reading the page…",
        success: (item) => ({
          message: "Saved to your memory",
          description: item?.title || trimmed,
        }),
        error: (message) => String(message),
      });

      try {
        await request;
        return true;
      } catch {
        return false;
      }
    },
    [dispatch],
  );

  const confirmDialog = (
    <ConfirmDialog
      open={Boolean(pending)}
      onClose={cancelDelete}
      onConfirm={confirmDelete}
      loading={pending ? deletingIds.includes(pending._id) : false}
      title="Delete this link?"
      message={
        pending
          ? `"${pending.title || pending.url}" will be removed from your memory. This can't be undone.`
          : undefined
      }
      confirmLabel="Delete"
    />
  );

  return {
    requestDelete,
    confirmDialog,
    save,
    deletingIds,
  };
}

export default useItemActions;
