import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

/**
 * Replaces every window.confirm() in the app.
 *
 * The native dialog blocks the whole tab, cannot be styled, and reads as a
 * browser warning rather than part of the product.
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onClose}
    size="sm"
    closeOnBackdrop={!loading}
    footer={
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          {cancelLabel}
        </Button>

        <Button
          variant={tone === "danger" ? "danger" : "primary"}
          size="md"
          onClick={onConfirm}
          loading={loading}
          className="flex-1"
        >
          {confirmLabel}
        </Button>
      </div>
    }
  >
    <div className="flex gap-3.5">
      <span
        className={
          tone === "danger"
            ? "shrink-0 w-10 h-10 rounded-full bg-danger-soft flex items-center justify-center"
            : "shrink-0 w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center"
        }
      >
        <AlertTriangle
          className={tone === "danger" ? "w-5 h-5 text-danger" : "w-5 h-5 text-accent"}
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0 pt-0.5">
        <h2 className="text-h3 font-semibold text-ink">{title}</h2>
        {message && <p className="mt-1.5 text-base text-muted">{message}</p>}
      </div>
    </div>
  </Modal>
);

export default ConfirmDialog;
