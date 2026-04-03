import { useDispatch } from "react-redux";
import { deleteItem } from "../item.slice";
import { X, ExternalLink } from "lucide-react";

export default function ItemCard({ item, variant = "default" }) {
  const dispatch = useDispatch();

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      dispatch(deleteItem(item._id));
    }
  };

  // Color schemes based on collection/category with primary color
  const getGradient = () => {
    const gradients = {
      Design: "from-[#F45B26]/20 to-[#F45B26]/10",
      Tech: "from-[#F45B26]/20 to-[#F45B26]/10",
      News: "from-[#F45B26]/20 to-[#F45B26]/10",
      Art: "from-[#F45B26]/20 to-[#F45B26]/10",
      Philosophy: "from-[#F45B26]/20 to-[#F45B26]/10",
    };
    return gradients[item.collection] || "from-[#F45B26]/20 to-[#F45B26]/10";
  };

  const getBorderColor = () => {
    return "hover:border-[#F45B26]/50";
  };

  if (variant === "featured") {
    return (
      <div
        className={`group relative bg-gradient-to-br ${getGradient()} rounded-xl p-5 border border-gray-800 ${getBorderColor()} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#F45B26]/10 backdrop-blur-sm`}
      >
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 text-red-500 hover:text-red-400 transition-colors z-10 bg-black/50 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete item"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F45B26]/10 to-transparent rounded-full blur-2xl" />

        <div className="relative z-10">
          <span className="text-xs font-semibold text-[#F45B26] tracking-wider uppercase">
            {item.collection || "UNCATEGORIZED"}
          </span>
          <h4 className="text-lg font-bold mt-2 mb-3 line-clamp-2">{item.title}</h4>
          <p className="text-sm text-gray-300 mb-4 line-clamp-3">{item.summary}</p>

          <div className="flex flex-wrap gap-2">
            {item.tags?.slice(0, 5).map((tag, tagIdx) => (
              <span key={tagIdx} className="text-xs px-2 py-1 bg-gray-800/70 rounded-full text-gray-300 hover:bg-[#F45B26]/20 hover:text-[#F45B26] transition-colors cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-xs text-[#F45B26] hover:text-[#F45B26]/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View Original</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Default card view (for potential list view or other layouts)
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-800 hover:border-[#F45B26]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#F45B26]/10 overflow-hidden group">
      <div className="p-4 relative">
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition-colors z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Delete item"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="pr-6">
          <h3 className="text-lg font-semibold line-clamp-2">{item.title}</h3>

          <p className="text-sm text-[#F45B26] mt-1 uppercase tracking-wider">
            {item.collection || "Uncategorized"}
          </p>

          <p className="text-sm mt-2 text-gray-300 line-clamp-3">
            {item.summary}
          </p>

          <div className="flex gap-2 mt-3 flex-wrap">
            {item.tags?.slice(0, 4).map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full hover:bg-[#F45B26]/20 hover:text-[#F45B26] transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-3 text-xs text-[#F45B26] hover:text-[#F45B26]/80 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Source</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
