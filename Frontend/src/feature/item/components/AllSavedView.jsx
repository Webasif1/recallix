// src/components/AllSavedView.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems, deleteItem } from '../item.slice';
import { Search, X, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AllSavedView = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState([]);
  const itemsArray = Array.isArray(items) ? items : [];

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(itemsArray);
    } else {
      const term = searchTerm.toLowerCase();
      setFiltered(itemsArray.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.summary?.toLowerCase().includes(term) ||
        item.tags?.some(t => t.toLowerCase().includes(term)) ||
        item.collection?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, itemsArray]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      dispatch(deleteItem(id)).unwrap()
        .then(() => toast.success('Deleted', { description: title }))
        .catch((err) => toast.error('Failed to delete', { description: err.message }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">All Saved Items</h1>
        <p className="text-gray-400 mt-1">Browse and manage your entire collection</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, summary, tags, or collection..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#F45B26] transition-colors"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F45B26]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item._id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 group relative">
              <button
                onClick={() => handleDelete(item._id, item.title)}
                className="absolute bottom-3 right-3 opacity-100 transition-opacity p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 z-10"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <h3 className="font-semibold text-white line-clamp-2 pr-6">{item.title}</h3>
              <p className="text-xs text-[#F45B26] mt-1 uppercase font-medium">
                {item.collection || 'Uncategorized'}
              </p>
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">{item.summary}</p>
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className=" p-1.5 text-gray-400 hover:text-[#F45B26] transition-colors rounded-md hover:bg-gray-800 absolute top-3 right-3"
                    title="Open original"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center py-12 text-gray-400">
              {searchTerm ? `No items found matching "${searchTerm}"` : "No saved items yet. Start adding URLs!"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AllSavedView;
