import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchItems } from "../item.slice";
import AddItem from "../components/AddItemComponents";
import ItemCard from "../components/ItemCard";
import {
  BookOpen,
  Activity,
  Tag,
  HardDrive,
  Star,
  ChevronRight,
  Sparkles,
  FolderArchive,
  Cpu,
  Database,
  Shield,
  Boxes
} from "lucide-react";

export default function Home() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Calculate stats from items
  const totalUrls = items.length;
  const totalTags = items.reduce((sum, item) => sum + (item.tags?.length || 0), 0);
  const storageUsed = (totalUrls * 0.0015).toFixed(1);
  const storageMax = 10;
  const storagePercentage = (storageUsed / storageMax) * 100;

  // Get recent items (last 3)
  const recentItems = items.slice(0, 3);
  const curatorChoice = items[0] || null;
  const philosophyItem = items[1] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(244,91,38,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(244,91,38,0.1),transparent_50%)]" />
      </div>

      {/* Main Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sm:mb-12 border-b border-gray-800 pb-4 sm:pb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-[#F45B26] to-[#F45B26]/80 rounded-xl shadow-lg shadow-[#F45B26]/20">
              <FolderArchive className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#F45B26] via-[#F45B26]/80 to-[#F45B26] bg-clip-text text-transparent">
                The Archive
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 tracking-wide">DIGITAL CURATOR</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
              <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-[#F45B26]" />
              <span className="text-xs text-gray-300 hidden sm:inline">GPT-4 Editorial Model</span>
              <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-[#F45B26]" />
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#F45B26]" />
            <span className="text-xs sm:text-sm font-semibold text-[#F45B26] tracking-wider">OVERVIEW</span>
          </div>
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 backdrop-blur-sm border border-gray-800">
            <h2 className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
              Curate your digital knowledge base.
            </h2>
            <div className="mt-4">
              <AddItem />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 sm:mb-12">
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 backdrop-blur-sm hover:border-[#F45B26]/30 transition-all duration-300">
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-2">
              <Database className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>URLs Analyzed</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F45B26]">{totalUrls}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 backdrop-blur-sm hover:border-[#F45B26]/30 transition-all duration-300">
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-2">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Tags Generated</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-[#F45B26]">{totalTags}</div>
          </div>
          <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 backdrop-blur-sm hover:border-[#F45B26]/30 transition-all duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-2">
              <HardDrive className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Storage Used</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold text-[#F45B26]">{storageUsed} GB</span>
              <span className="text-xs sm:text-sm text-gray-500">/ {storageMax} GB</span>
            </div>
            <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F45B26] to-[#F45B26]/70 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recent Acquisitions */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-[#F45B26]" />
              <h3 className="text-lg sm:text-xl font-semibold">Recent Acquisitions</h3>
              <span className="text-xs sm:text-sm text-gray-400 ml-2">
                {totalUrls} {totalUrls === 1 ? 'item' : 'items'} archived
              </span>
            </div>
            {recentItems.length > 0 && (
              <button className="text-xs sm:text-sm text-[#F45B26] hover:text-[#F45B26]/80 flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#F45B26]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentItems.map((item) => (
                <ItemCard key={item._id} item={item} variant="featured" />
              ))}
              {recentItems.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-400">
                  No items yet. Add your first URL above to start curating.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Curator Choice */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-800 overflow-hidden hover:border-[#F45B26]/30 transition-all duration-300">
            <div className="bg-gradient-to-r from-[#F45B26]/10 to-[#F45B26]/5 px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#F45B26]" />
                <span className="text-xs sm:text-sm font-semibold text-[#F45B26]">CURATOR CHOICE</span>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {curatorChoice ? (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-[#F45B26] tracking-wider">
                      {curatorChoice.collection || "FEATURED"}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold mt-1 mb-2 line-clamp-2">{curatorChoice.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{curatorChoice.summary}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {curatorChoice.tags?.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#F45B26] to-[#F45B26]/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-400 text-sm sm:text-base">
                  No featured item yet
                </div>
              )}
            </div>
          </div>

          {/* Philosophy */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800/50 rounded-xl border border-gray-800 overflow-hidden hover:border-[#F45B26]/30 transition-all duration-300">
            <div className="bg-gradient-to-r from-[#F45B26]/10 to-[#F45B26]/5 px-4 sm:px-5 py-2 sm:py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Boxes className="w-3 h-3 sm:w-4 sm:h-4 text-[#F45B26]" />
                <span className="text-xs sm:text-sm font-semibold text-[#F45B26]">PHILOSOPHY</span>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              {philosophyItem ? (
                <>
                  <h4 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">{philosophyItem.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-300 mb-3 line-clamp-2">{philosophyItem.summary}</p>
                  <div className="flex gap-2 flex-wrap">
                    {philosophyItem.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-400 text-sm sm:text-base">
                  Add items to see philosophy section
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F45B26] rounded-full animate-pulse" />
              <span>Auto-tagging Active</span>
            </div>
            <span className="hidden sm:inline">Using GPT-4 Editorial Model</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            <span>Encrypted Archive • v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
