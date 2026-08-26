import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  CalendarDays,
  LogOut,
  Bookmark,
  FolderOpen,
  Hash,
  Plus,
  Pencil,
  KeyRound,
} from "lucide-react";
import Button from "../../../shared/ui/Button";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { Skeleton } from "../../../shared/ui/Skeleton";
import BlobChart from "../../../shared/ui/charts/BlobChart";
import ActivityCalendar from "./ActivityCalendar";
import { useAuth } from "../../auth/hook/useAuth";
import EditProfileDialog from "../../auth/components/EditProfileDialog";
import ChangePasswordDialog from "../../auth/components/ChangePasswordDialog";
import notify from "../../../shared/lib/notify";
import { formatDate, timeAgo } from "../../../shared/lib/formatDate";

const TYPE_LABEL = {
  article: "Articles",
  video: "Videos",
  pdf: "PDFs",
  image: "Images",
  other: "Other",
};

/**
 * The avatar is a user-supplied URL (there is no upload backend), so it may
 * 404 or be blocked. Falling back through state rather than mutating the DOM
 * keeps React in charge of what is rendered.
 */
const Avatar = ({ src, initial }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="w-14 h-14 rounded-full bg-accent-soft border border-accent-line flex items-center justify-center text-h1 font-semibold text-accent shrink-0">
        {initial}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="w-14 h-14 rounded-full object-cover border border-line bg-raised shrink-0"
    />
  );
};

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0">
    <span className="w-8 h-8 rounded-control bg-raised flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-muted" aria-hidden="true" />
    </span>

    <div className="min-w-0">
      <p className="text-caption text-muted">{label}</p>
      <p className="text-small text-ink truncate">{value || "—"}</p>
    </div>
  </div>
);

const MiniStat = ({ icon: Icon, label, value, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 min-w-0 bg-raised rounded-card px-3 py-2.5 text-left hover:bg-sunken transition-colors"
  >
    <span className="flex items-center gap-1.5 text-caption text-muted">
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
    <span className="block mt-0.5 text-h2 font-semibold text-ink tabular-nums">
      {value}
    </span>
  </button>
);

const Profile = ({ items, listStatus, error, onRetry, onNavigate, onQuickSave }) => {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const user = useSelector((state) => state.auth.user);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const stats = useMemo(() => {
    const collections = new Set();
    const tags = new Set();
    const types = new Map();

    for (const item of items) {
      if (item.collection) collections.add(item.collection);
      item.tags?.forEach((t) => tags.add(t));

      const label = TYPE_LABEL[item.type] ?? TYPE_LABEL.other;
      types.set(label, (types.get(label) ?? 0) + 1);
    }

    return {
      total: items.length,
      collections: collections.size,
      tags: tags.size,
      lastSave: items[0]?.createdAt,
      typeMix: [...types.entries()].map(([label, value]) => ({ label, value })),
    };
  }, [items]);

  const onLogout = async () => {
    setLoggingOut(true);

    try {
      await handleLogout();
      notify.success("Signed out", { id: "auth-logout" });
      navigate("/", { replace: true });
    } catch {
      notify.error("Couldn't sign you out", { id: "auth-logout" });
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  };

  // The store holds the user payload directly (it used to hold the whole
  // response envelope, so this screen read user.data.* and the sidebar read
  // user.username — one of them was always wrong).
  if (!user) {
    return (
      <EmptyState
        icon={User}
        title="You're not signed in"
        description="Sign in to see your account."
        action={{ label: "Go to sign in", onClick: () => navigate("/login") }}
      />
    );
  }

  const initial = (user.username?.[0] ?? "U").toUpperCase();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Greeting header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h1 font-semibold text-ink">
            Hi, {user.username}
          </h1>
          <p className="mt-1 text-base text-muted">
            Here's how your memory is doing
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={LogOut}
          onClick={() => setConfirmOpen(true)}
        >
          Sign out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 items-start">
        {/* ---- Identity + library mix ---- */}
        <section className="bg-surface border border-line rounded-card shadow-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <Avatar src={user.profileImage} initial={initial} />

            <div className="min-w-0 flex-1">
              <h2 className="text-h2 font-semibold text-ink truncate">
                {user.username}
              </h2>
              <p className="text-small text-muted truncate">{user.email}</p>

              {user.bio && (
                <p className="mt-2 text-small text-body">{user.bio}</p>
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Pencil}
              onClick={() => setEditOpen(true)}
              className="shrink-0"
            >
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </div>

          <div className="mt-5 flex gap-2">
            <MiniStat
              icon={Bookmark}
              label="Saved"
              value={stats.total}
              onClick={() => onNavigate("library")}
            />
            <MiniStat
              icon={FolderOpen}
              label="Collections"
              value={stats.collections}
              onClick={() => onNavigate("collections")}
            />
            <MiniStat
              icon={Hash}
              label="Tags"
              value={stats.tags}
              onClick={() => onNavigate("library")}
            />
          </div>

          <div className="mt-6 pt-5 border-t border-line">
            <h3 className="text-h3 font-semibold text-ink">Your library mix</h3>
            <p className="mt-1 text-small text-muted">
              What kind of thing you tend to keep
            </p>

            {stats.typeMix.length > 0 ? (
              <BlobChart
                data={stats.typeMix}
                width={340}
                height={250}
                className="mt-5"
              />
            ) : (
              <p className="mt-6 text-small text-muted text-center">
                Save a link and your mix appears here.
              </p>
            )}
          </div>
        </section>

        {/* ---- Right column ---- */}
        <div className="space-y-4 min-w-0">
          <ListState
            status={listStatus}
            error={error}
            onRetry={onRetry}
            hasContent={items.length > 0}
            isEmpty={items.length === 0}
            skeleton={<Skeleton className="h-[26rem] rounded-card" />}
            empty={
              <EmptyState
                icon={CalendarDays}
                title="No saving days yet"
                description="Save your first link and this calendar starts filling in."
                action={{
                  label: "Save a link",
                  icon: Plus,
                  onClick: onQuickSave,
                }}
              />
            }
          >
            <ActivityCalendar items={items} />
          </ListState>

          {/* ---- Account ---- */}
          <section className="bg-surface border border-line rounded-card shadow-card overflow-hidden">
            <h2 className="text-h3 font-semibold text-ink px-4 pt-4 pb-3">
              Account
            </h2>

            <Row icon={Mail} label="Email" value={user.email} />
            <Row icon={User} label="Username" value={user.username} />
            <Row
              icon={CalendarDays}
              label="Member since"
              value={formatDate(user.createdAt)}
            />
            <Row
              icon={Bookmark}
              label="Last save"
              value={stats.lastSave ? timeAgo(stats.lastSave) : "Nothing yet"}
            />

            <div className="p-4 border-t border-line flex flex-col sm:flex-row gap-2">
              <Button
                variant="secondary"
                size="md"
                icon={Pencil}
                onClick={() => setEditOpen(true)}
                className="flex-1"
              >
                Edit profile
              </Button>

              <Button
                variant="secondary"
                size="md"
                icon={KeyRound}
                onClick={() => setPasswordOpen(true)}
                className="flex-1"
              >
                Change password
              </Button>
            </div>
          </section>
        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
      />

      <ChangePasswordDialog
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onLogout}
        loading={loggingOut}
        tone="accent"
        title="Sign out of Recallix?"
        message="Everything you saved stays exactly where it is."
        confirmLabel="Sign out"
      />
    </div>
  );
};

export default Profile;
