import { useEffect, useState } from "react";
import { Link2, Sparkle, ClipboardPaste } from "lucide-react";
import Modal from "../../../shared/ui/Modal";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import { getDomain } from "../../../shared/lib/domain";

/**
 * Save flow.
 *
 * One field, because one field is all the API needs — the server scrapes the
 * title, writes the summary, picks the tags and files it into a collection.
 * Rather than asking for that up front, we say plainly what will happen, so
 * the wait afterwards is expected instead of mysterious.
 */
const QuickSaveModal = ({ open, onClose, onSave }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setUrl("");
      setError(null);
      setSaving(false);
    }
  }, [open]);

  const domain = getDomain(url);

  // Mirrors Backend/src/utils/normalizeUrl.js: bare domains are accepted and
  // https is assumed, so "react.dev/learn" is valid input.
  const isValid = (value) => {
    const raw = value.trim();
    if (!raw) return false;

    try {
      const parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      return parsed.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard read is permission-gated; typing still works.
      setError("Your browser blocked clipboard access — paste it manually.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!isValid(url)) {
      setError("That doesn't look like a link. Try https://example.com/article");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(url.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      closeOnBackdrop={!saving}
      title="Save a link"
      description="Paste it and forget it — you'll find it again by memory."
    >
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Link"
          type="url"
          inputMode="url"
          icon={Link2}
          autoComplete="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          error={error}
          disabled={saving}
          autoFocus
        />

        {navigator.clipboard?.readText && !url && (
          <button
            type="button"
            onClick={pasteFromClipboard}
            disabled={saving}
            className="mt-2 inline-flex items-center gap-1.5 text-small text-accent hover:underline rounded"
          >
            <ClipboardPaste className="w-3.5 h-3.5" aria-hidden="true" />
            Paste from clipboard
          </button>
        )}

        {/* Progressive disclosure: what Recallix will do, shown only once
            there is something to do it to. */}
        {domain && isValid(url) && (
          <div className="mt-4 bg-raised border border-line rounded-card p-4 rx-fade-up">
            <div className="flex items-center gap-2 text-small font-medium text-ink">
              <Sparkle className="w-4 h-4 text-accent" aria-hidden="true" />
              Recallix will handle the rest
            </div>

            <ul className="mt-2.5 space-y-1 text-small text-muted">
              <li>· Read the page at {domain}</li>
              <li>· Write a short summary and pick tags</li>
              <li>· File it into the right collection</li>
            </ul>

            <p className="mt-3 text-caption text-faint">
              Takes a few seconds. You can keep working.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-5">
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
            {saving ? "Saving…" : "Save link"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickSaveModal;
