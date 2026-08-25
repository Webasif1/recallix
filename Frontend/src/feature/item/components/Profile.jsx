import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { User, Mail, CalendarDays, LogOut, Bookmark, FolderOpen, Hash } from "lucide-react";
import PageHeader from "../../../shared/ui/PageHeader";
import Button from "../../../shared/ui/Button";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import EmptyState from "../../../shared/ui/EmptyState";
import { useAuth } from "../../auth/hook/useAuth";
import notify from "../../../shared/lib/notify";
import { formatDate, timeAgo } from "../../../shared/lib/formatDate";

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3.5 border-b border-line last:border-0">
    <Icon className="w-4 h-4 text-muted shrink-0" aria-hidden="true" />

    <div className="min-w-0">
      <p className="text-caption text-muted">{label}</p>
      <p className="text-small text-ink truncate">{value || "—"}</p>
    </div>
  </div>
);

const Profile = ({ items, onNavigate }) => {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const user = useSelector((state) => state.auth.user);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const stats = useMemo(() => {
    const collections = new Set();
    const tags = new Set();

    for (const item of items) {
      if (item.collection) collections.add(item.collection);
      item.tags?.forEach((t) => tags.add(t));
    }

    return {
      total: items.length,
      collections: collections.size,
      tags: tags.size,
      lastSave: items[0]?.createdAt,
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

  // The store holds the user payload directly now (it used to hold the whole
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

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader icon={User} title="Profile" subtitle="Your Recallix account" />

      <div className="bg-surface border border-line rounded-card shadow-card overflow-hidden">
        <div className="flex items-center gap-4 p-5 border-b border-line">
          <span className="w-16 h-16 rounded-full bg-accent-soft border border-accent-line flex items-center justify-center text-h1 font-semibold text-accent shrink-0">
            {(user.username?.[0] ?? "U").toUpperCase()}
          </span>

          <div className="min-w-0">
            <h2 className="text-h2 font-semibold text-ink truncate">
              {user.username}
            </h2>
            <p className="text-small text-muted">
              Remembering things since {formatDate(user.createdAt) || "recently"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {[
            { icon: Bookmark, label: "Saved", value: stats.total, view: "library" },
            {
              icon: FolderOpen,
              label: "Collections",
              value: stats.collections,
              view: "collections",
            },
            { icon: Hash, label: "Tags", value: stats.tags, view: "graph" },
          ].map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => onNavigate(stat.view)}
              className="p-4 text-center hover:bg-raised transition-colors"
            >
              <stat.icon
                className="w-4 h-4 text-muted mx-auto"
                aria-hidden="true"
              />
              <p className="mt-1.5 text-h2 font-semibold text-ink tabular-nums">
                {stat.value}
              </p>
              <p className="text-caption text-muted">{stat.label}</p>
            </button>
          ))}
        </div>

        <Row icon={Mail} label="Email" value={user.email} />
        <Row icon={User} label="Username" value={user.username} />
        <Row
          icon={CalendarDays}
          label="Last save"
          value={stats.lastSave ? timeAgo(stats.lastSave) : "Nothing saved yet"}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          variant="dangerGhost"
          size="md"
          icon={LogOut}
          onClick={() => setConfirmOpen(true)}
        >
          Sign out
        </Button>
      </div>

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
