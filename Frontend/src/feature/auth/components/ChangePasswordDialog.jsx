import { useEffect, useState } from "react";
import { Lock, AlertCircle, ShieldCheck } from "lucide-react";
import Modal from "../../../shared/ui/Modal";
import Input from "../../../shared/ui/Input";
import Button from "../../../shared/ui/Button";
import { useAuth } from "../hook/useAuth";
import notify from "../../../shared/lib/notify";
import {
  getApiErrorMessage,
  getFieldErrors,
} from "../../../shared/lib/apiClient";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

const ChangePasswordDialog = ({ open, onClose }) => {
  const { handleChangePassword } = useAuth();

  const [values, setValues] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setValues(EMPTY);
    setFieldErrors({});
    setFormError(null);
  }, [open]);

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  const validate = () => {
    const errors = {};

    if (!values.currentPassword)
      errors.currentPassword = "Enter your current password";

    if (!values.newPassword) errors.newPassword = "Enter a new password";
    else if (values.newPassword.length < 6)
      errors.newPassword = "At least 6 characters";
    else if (values.newPassword === values.currentPassword)
      errors.newPassword = "Choose a different password";

    if (values.confirmPassword !== values.newPassword)
      errors.confirmPassword = "Passwords don't match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !validate()) return;

    setSaving(true);
    setFormError(null);

    try {
      await handleChangePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      notify.success("Password updated", {
        description: "Other devices have been signed out.",
        id: "password-change",
      });
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Couldn't change password");

      setFormError(message);
      setFieldErrors(getFieldErrors(err));
      notify.error(message, { id: "password-change" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      title="Change password"
      description="You'll stay signed in here. Other devices will be signed out."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-danger-soft border border-danger/20 rounded-control px-3.5 py-3"
          >
            <AlertCircle
              className="w-4 h-4 text-danger shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-small text-danger">{formError}</p>
          </div>
        )}

        <Input
          label="Current password"
          type="password"
          name="currentPassword"
          icon={Lock}
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={(e) => setField("currentPassword", e.target.value)}
          error={fieldErrors.currentPassword}
          disabled={saving}
          autoFocus
        />

        <Input
          label="New password"
          type="password"
          name="newPassword"
          icon={Lock}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={values.newPassword}
          onChange={(e) => setField("newPassword", e.target.value)}
          error={fieldErrors.newPassword}
          disabled={saving}
        />

        <Input
          label="Confirm new password"
          type="password"
          name="confirmPassword"
          icon={Lock}
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={(e) => setField("confirmPassword", e.target.value)}
          error={fieldErrors.confirmPassword}
          disabled={saving}
        />

        <p className="flex items-start gap-2 text-caption text-muted">
          <ShieldCheck
            className="w-3.5 h-3.5 shrink-0 mt-0.5 text-success"
            aria-hidden="true"
          />
          Any session on another device stops working as soon as this succeeds.
        </p>

        <div className="flex gap-3 pt-1">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            className="flex-1"
          >
            {saving ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordDialog;
