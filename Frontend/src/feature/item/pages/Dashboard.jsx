import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchItems } from "../item.slice";
import { useItemActions } from "../hook/useItemActions";
import AppSidebar from "../components/AppSidebar";
import HomeView from "../components/HomeView";
import LibraryView from "../components/LibraryView";
import RecallView from "../components/RecallView";
import CollectionsView from "../components/CollectionsView";
import CollectionView from "../components/CollectionView";
import ResurfacedView from "../components/ResurfacedView";
import Profile from "../components/Profile";
import QuickSaveModal from "../components/QuickSaveModal";
import TimelineView from "../components/TimelineView";

const VALID_VIEWS = [
  "home",
  "recall",
  "library",
  "collections",
  "graph",
  "resurfaced",
  "profile",
];

const Dashboard = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();

  const { items, listStatus, error } = useSelector((state) => state.items);
  const { requestDelete, confirmDialog, save } = useItemActions();

  // View lives in the URL so back/forward work, views are linkable, and a
  // refresh does not drop the user back on Home.
  const rawView = params.get("view") || "home";
  const collection = params.get("collection");
  const activeView = VALID_VIEWS.includes(rawView) ? rawView : "home";

  // Fetched ONCE here rather than in every view. The thunk's `condition`
  // guard also blocks refetching data that is still fresh.
  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const setView = useCallback(
    (view, extra = {}) => {
      const next = { view };
      if (extra.collection) next.collection = extra.collection;
      if (extra.tag) next.tag = extra.tag;

      setParams(next);
    },
    [setParams],
  );

  const openCollection = useCallback(
    (name) => setView("collections", { collection: name }),
    [setView],
  );

  const openTag = useCallback(
    (tag) => setView("library", { tag }),
    [setView],
  );

  const quickSaveOpen = params.get("save") === "1";

  const setQuickSave = useCallback(
    (open) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev);
        if (open) next.set("save", "1");
        else next.delete("save");
        return next;
      });
    },
    [setParams],
  );

  const handleSave = async (url) => {
    const ok = await save(url);
    if (ok) setQuickSave(false);
    return ok;
  };

  const retry = useCallback(
    () => dispatch(fetchItems({ force: true })),
    [dispatch],
  );

  const shared = {
    items,
    listStatus,
    error,
    onRetry: retry,
    onDelete: requestDelete,
    onTagClick: openTag,
    onCollectionClick: openCollection,
    onNavigate: setView,
    onQuickSave: () => setQuickSave(true),
  };

  const renderView = () => {
    if (activeView === "collections" && collection) {
      return (
        <CollectionView
          {...shared}
          collectionName={collection}
          onBack={() => setView("collections")}
        />
      );
    }

    switch (activeView) {
      case "recall":
        return <RecallView {...shared} />;
      case "library":
        return <LibraryView {...shared} activeTag={params.get("tag")} />;
      case "collections":
        return <CollectionsView {...shared} />;
      case "resurfaced":
        return <ResurfacedView {...shared} />;
      case "profile":
        return <Profile {...shared} />;
      // Route id stays "graph" so existing ?view=graph links keep working
      case "graph":
        return <TimelineView {...shared} />;
      default:
        return <HomeView {...shared} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      <AppSidebar
        activeView={activeView}
        activeCollection={collection}
        onViewChange={setView}
        onCollectionClick={openCollection}
        onQuickSave={() => setQuickSave(true)}
      />

      <main
        id="main"
        className="flex-1 min-w-0 pt-16 md:pt-0 pb-24 md:pb-0 overflow-x-hidden"
      >
        <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-9">{renderView()}</div>
      </main>

      <QuickSaveModal
        open={quickSaveOpen}
        onClose={() => setQuickSave(false)}
        onSave={handleSave}
      />

      {confirmDialog}
    </div>
  );
};

export default Dashboard;
