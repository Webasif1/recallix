import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Sparkle,
  Search,
  Library,
  Network,
  Clock,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../auth/hook/useAuth";
import Button from "../../../shared/ui/Button";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog";
import notify from "../../../shared/lib/notify";
import { cx } from "../../../shared/lib/cx";

const NAV = [
  { id: "home", label: "Home", icon: Home },
  { id: "recall", label: "Recall", icon: Search },
  { id: "library", label: "Library", icon: Library },
  { id: "collections", label: "Collections", icon: FolderOpen },
  { id: "graph", label: "Graph", icon: Network },
  { id: "resurfaced", label: "Resurfaced", icon: Clock },
];

// The four most common actions on a phone, as a bottom bar.
const MOBILE_NAV = NAV.slice(0, 4);

const AppSidebar = ({
  activeView,
  activeCollection,
  onViewChange,
  onCollectionClick,
  onQuickSave,
}) => {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const items = useSelector((state) => state.items.items);
  const user = useSelector((state) => state.auth.user);
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const collections = useMemo(() => {
    const map = new Map();

    for (const item of items) {
      if (!item.collection) continue;
      map.set(item.collection, (map.get(item.collection) ?? 0) + 1);
    }

    return [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);

  // Close the drawer whenever the view changes
  useEffect(() => {
    setMobileOpen(false);
  }, [activeView, activeCollection]);

  // Lock background scroll while the drawer is open
  useEffect(() => {
    if (!mobileOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

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
      setConfirmLogout(false);
    }
  };

  const navButton = (item) => {
    const isActive = activeView === item.id && !activeCollection;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onViewChange(item.id)}
        aria-current={isActive ? "page" : undefined}
        className={cx(
          "w-full flex items-center gap-3 px-3 py-2 rounded-control text-small transition-colors",
          isActive
            ? "bg-accent-soft text-accent font-medium"
            : "text-body hover:bg-raised hover:text-ink",
        )}
      >
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {item.label}
      </button>
    );
  };

  const content = (
    <>
      <div className="px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-control bg-accent flex items-center justify-center">
            <Sparkle className="w-4 h-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-h3 font-semibold text-ink tracking-tight">
            Recallix
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="md:hidden"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="px-3 pb-3">
        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={onQuickSave}
          className="w-full"
        >
          Save a link
        </Button>
      </div>

      <nav aria-label="Main" className="flex-1 px-3 overflow-y-auto">
        <div className="space-y-0.5">{NAV.map(navButton)}</div>

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setCollectionsOpen((v) => !v)}
            aria-expanded={collectionsOpen}
            className="w-full flex items-center gap-1.5 px-3 py-1.5 text-caption font-medium uppercase tracking-wide text-muted hover:text-ink transition-colors"
          >
            {collectionsOpen ? (
              <ChevronDown className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            )}
            Collections
            <span className="ml-auto text-faint normal-case">
              {collections.length || ""}
            </span>
          </button>

          {collectionsOpen && (
            <div className="mt-1 space-y-0.5">
              {collections.slice(0, 8).map((col) => {
                const isActive = activeCollection === col.name;

                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => onCollectionClick(col.name)}
                    aria-current={isActive ? "page" : undefined}
                    className={cx(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-small transition-colors",
                      isActive
                        ? "bg-accent-soft text-accent font-medium"
                        : "text-body hover:bg-raised hover:text-ink",
                    )}
                  >
                    <FolderOpen
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate flex-1 text-left">{col.name}</span>
                    <span className="text-caption text-faint">{col.count}</span>
                  </button>
                );
              })}

              {collections.length > 8 && (
                <button
                  type="button"
                  onClick={() => onViewChange("collections")}
                  className="w-full text-left px-3 py-2 text-caption text-accent hover:underline"
                >
                  View all {collections.length}
                </button>
              )}

              {collections.length === 0 && (
                <p className="px-3 py-2 text-caption text-faint">
                  Collections appear as you save.
                </p>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-line space-y-1">
        <button
          type="button"
          onClick={() => onViewChange("profile")}
          aria-current={activeView === "profile" ? "page" : undefined}
          className={cx(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-small transition-colors",
            activeView === "profile"
              ? "bg-accent-soft text-accent"
              : "text-body hover:bg-raised hover:text-ink",
          )}
        >
          <span className="w-6 h-6 rounded-full bg-accent-soft border border-accent-line flex items-center justify-center text-caption font-semibold text-accent shrink-0">
            {(user?.username?.[0] ?? "U").toUpperCase()}
          </span>
          <span className="truncate font-medium">
            {user?.username ?? "Account"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmLogout(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-control text-small text-muted hover:bg-danger-soft hover:text-danger transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-16 bg-surface/95 backdrop-blur border-b border-line flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-control bg-accent flex items-center justify-center">
            <Sparkle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </span>
          <span className="text-h3 font-semibold text-ink">Recallix</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </Button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            aria-label="Navigation"
            className="relative w-72 max-w-[85vw] h-full bg-surface border-r border-line flex flex-col rx-fade-up"
          >
            {content}
          </aside>
        </div>
      )}

      {/* Desktop rail */}
      <aside
        aria-label="Navigation"
        className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 bg-surface border-r border-line flex-col"
      >
        {content}
      </aside>

      {/* Mobile bottom bar — the common actions without opening the drawer */}
      <nav
        aria-label="Quick navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line"
      >
        <div className="grid grid-cols-5 items-center">
          {MOBILE_NAV.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cx(
                  "flex flex-col items-center gap-0.5 py-2.5 min-h-14 text-caption transition-colors",
                  isActive ? "text-accent" : "text-muted",
                )}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onQuickSave}
              aria-label="Save a link"
              className="w-12 h-12 -mt-5 rounded-full bg-accent text-white flex items-center justify-center shadow-pop active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {MOBILE_NAV.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onViewChange(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={cx(
                  "flex flex-col items-center gap-0.5 py-2.5 min-h-14 text-caption transition-colors",
                  isActive ? "text-accent" : "text-muted",
                )}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={onLogout}
        loading={loggingOut}
        tone="accent"
        title="Sign out of Recallix?"
        message="Everything you saved stays exactly where it is."
        confirmLabel="Sign out"
      />
    </>
  );
};

export default AppSidebar;
