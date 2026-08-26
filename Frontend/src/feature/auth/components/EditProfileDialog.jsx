import { useEffect, useState } from "react";
import { User, Image as ImageIcon, AlertCircle } from "lucide-react";
import Modal from "../../../shared/ui/Modal";
import Input from "../../../shared/ui/Input";
import Button from "../../../shared/ui/Button";
import { useAuth } from "../hook/useAuth";
import notify from "../../../shared/lib/notify";
import {
  getApiErrorMessage,
  getFieldErrors,
} from "../../../shared/lib/apiClient";

/** Edit username, bio and avatar. Email is intentionally not editable. */
const EditProfileDialog = ({ open, onClose, user }) => {
  const { handleUpdateProfile } = useAuth();

  const [values, setValues] = useState({
    username: "",
    bio: "",
    profileImage: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Re-seed each time it opens, so cancelling discards edits
  useEffect(() => {
    if (!open) return;

    setValues({
      username: user?.username ?? "",
      bio: user?.bio ?? "",
      profileImage: user?.profileImage ?? "",
    });
    setFieldErrors({});
    setFormError(null);
  }, [open, user]);

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError(null);
  };

  const validate = () => {
    const errors = {};
    const username = values.username.trim();

    if (!username) errors.username = "Username is required";
    else if (username.length < 3 || username.length > 30)
      errors.username = "Use between 3 and 30 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      errors.username = "Letters, numbers and underscores only";

    if (values.bio.length > 280) errors.bio = "280 characters at most";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving || !validate()) return;

    // Only send what actually changed — this is a partial update
    const changes = {};
    if (values.username.trim() !== user?.username)
      changes.username = values.username.trim();
    if (values.bio.trim() !== (user?.bio ?? "")) changes.bio = values.bio.trim();
    if (values.profileImage.trim() !== (user?.profileImage ?? ""))
      changes.profileImage = values.profileImage.trim();

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      await handleUpdateProfile(changes);
      notify.success("Profile updated", { id: "profile-update" });
      onClose();
    } catch (err) {
      const message = getApiErrorMessage(err, "Couldn't update profile");

      setFormError(message);
      setFieldErrors(getFieldErrors(err));
      notify.error(message, { id: "profile-update" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      title="Edit profile"
      description="Your email stays the same — it's how you sign in."
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
          label="Username"
          name="username"
          icon={User}
          autoComplete="username"
          value={values.username}
          onChange={(e) => setField("username", e.target.value)}
          error={fieldErrors.username}
          disabled={saving}
          autoFocus
        />

        <div>
          <label
            htmlFor="profile-bio"
            className="block text-small font-medium text-ink mb-1.5"
          >
            Bio
          </label>
          <textarea
            id="profile-bio"
            rows={3}
            value={values.bio}
            onChange={(e) => setField("bio", e.target.value)}
            disabled={saving}
            maxLength={280}
            placeholder="A line about what you collect."
            aria-invalid={fieldErrors.bio ? "true" : undefined}
            className="w-full bg-surface border border-line rounded-control px-3.5 py-2.5 text-base text-ink placeholder:text-faint resize-y transition-colors focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:bg-raised"
          />
          <div className="mt-1.5 flex justify-between gap-3">
            <p className="text-small text-danger">{fieldErrors.bio}</p>
            <p className="text-caption text-faint tabular-nums shrink-0">
              {values.bio.length}/280
            </p>
          </div>
        </div>

        <div>
          <Input
            label="Avatar image URL"
            name="profileImage"
            icon={ImageIcon}
            inputMode="url"
            placeholder="https://example.com/photo.jpg"
            value={values.profileImage}
            onChange={(e) => setField("profileImage", e.target.value)}
            error={fieldErrors.profileImage}
            // There is no file-upload backend, so this is a link, not an upload
            hint="Paste an image link. Leave empty for the default avatar."
            disabled={saving}
          />

          {values.profileImage.trim() && (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={values.profileImage.trim()}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "";
                }}
                className="w-11 h-11 rounded-full object-cover border border-line bg-raised"
              />
              <p className="text-caption text-muted">Preview</p>
            </div>
          )}
        </div>

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
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileDialog;
