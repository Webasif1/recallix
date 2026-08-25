import { useMemo } from "react";
import { ArrowLeft, FolderOpen, Plus } from "lucide-react";
import LinkCard from "../../../shared/ui/LinkCard";
import EmptyState from "../../../shared/ui/EmptyState";
import ListState from "../../../shared/ui/ListState";
import { LinkGridSkeleton } from "../../../shared/ui/Skeleton";
import Button from "../../../shared/ui/Button";
import PageHeader from "../../../shared/ui/PageHeader";

/** One collection, drilled into from the sidebar or the collections grid. */
const CollectionView = ({
  items,
  listStatus,
  error,
  onRetry,
  onDelete,
  onTagClick,
  onBack,
  onQuickSave,
  collectionName,
}) => {
  const collectionItems = useMemo(
    () => items.filter((item) => item.collection === collectionName),
    [items, collectionName],
  );

  return (
    <div className="max-w-6xl mx-auto">
      <Button
        variant="ghost"
        size="sm"
        icon={ArrowLeft}
        onClick={onBack}
        className="-ml-2 mb-4"
      >
        All collections
      </Button>

      <PageHeader
        icon={FolderOpen}
        title={collectionName}
        subtitle={`${collectionItems.length} ${
          collectionItems.length === 1 ? "link" : "links"
        } in this collection`}
      />

      <ListState
        status={listStatus}
        error={error}
        onRetry={onRetry}
        hasContent={items.length > 0}
        isEmpty={collectionItems.length === 0}
        skeleton={<LinkGridSkeleton />}
        empty={
          <EmptyState
            icon={FolderOpen}
            title="Nothing here anymore"
            description={`No saved links are filed under "${collectionName}". The collection disappears once it's empty.`}
            action={{ label: "Save a link", icon: Plus, onClick: onQuickSave }}
            secondaryAction={{ label: "Back to collections", onClick: onBack }}
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {collectionItems.map((item) => (
            <LinkCard
              key={item._id}
              item={item}
              headingLevel={2}
              onDelete={onDelete}
              onTagClick={onTagClick}
            />
          ))}
        </div>
      </ListState>
    </div>
  );
};

export default CollectionView;
