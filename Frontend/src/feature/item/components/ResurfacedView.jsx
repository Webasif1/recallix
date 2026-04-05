// src/components/ResurfacedView.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems, deleteItem } from '../item.slice';
import { Clock, Calendar, TrendingUp, Trash2 } from 'lucide-react';
import Loading from './Loading'
import { toast } from 'sonner';

const ResurfacedView = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];
  const resurfacedItems = itemsArray.slice(0, 6);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      dispatch(deleteItem(id)).unwrap()
        .then(() => toast.success('Deleted', { description: title }))
        .catch((err) => toast.error('Failed to delete', { description: err.message }));
    }
  };

  if (loading) return <Loading message="Resurfacing memories..." />;
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-2 bg-[#F45B26]/10 rounded-xl">
          <Clock className="w-6 h-6 text-[#F45B26]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Resurfaced Memories</h1>
          <p className="text-gray-400 mt-1">
            Items that need your attention • {resurfacedItems.length} ready to revisit
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F45B26]"></div>
        </div>
      ) : (
        <>
          {resurfacedItems.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/30 rounded-xl border border-gray-800">
              <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No resurfaced items yet.</p>
              <p className="text-sm text-gray-500 mt-1">Save more content to see resurfaced memories.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {resurfacedItems.map((item, index) => (
                <div
                  key={item._id}
                  className="bg-gradient-to-r from-gray-900/80 to-gray-800/40 rounded-xl border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 p-5 group relative"
                >
                  <button
                    onClick={() => handleDelete(item._id, item.title)}
                    className="absolute bottom-3 right-4 opacity-100 transition-opacity p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 z-10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="flex-1 pr-8">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-[#F45B26]/10 text-[#F45B26] rounded-full">
                          {item.collection || 'General'}
                        </span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Top Pick
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#F45B26] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-300 text-sm mt-2 line-clamp-3">{item.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.tags?.slice(0, 4).map(tag => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 whitespace-nowrap">
                      <Calendar className="w-3 h-3" />
                      <span>{getTimeAgo(item.createdAt || item.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResurfacedView;
