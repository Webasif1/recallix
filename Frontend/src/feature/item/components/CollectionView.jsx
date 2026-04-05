// src/components/CollectionView.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems, deleteItem } from '../item.slice';
import { ArrowLeft, Trash2, ExternalLink } from 'lucide-react'; // ← added ExternalLink
import { toast } from 'sonner';

const CollectionView = ({ collectionName, onBack }) => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];
  const [collectionItems, setCollectionItems] = useState([]);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  useEffect(() => {
    setCollectionItems(itemsArray.filter(item => item.collection === collectionName));
  }, [itemsArray, collectionName]);

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      dispatch(deleteItem(id)).unwrap()
        .then(() => toast.success('Deleted', { description: title }))
        .catch((err) => toast.error('Failed to delete', { description: err.message }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{collectionName}</h1>
        <p className="text-gray-400 mt-1">{collectionItems.length} items in this collection</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F45B26]"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collectionItems.map(item => (
            <div key={item._id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 group relative">
              {/* Delete button */}
              <button
                onClick={() => handleDelete(item._id, item.title)}
                className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 z-10"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <h3 className="font-semibold text-white line-clamp-2 pr-6">{item.title}</h3>
              <p className="text-sm text-gray-300 mt-2 line-clamp-3">{item.summary}</p>

              {/* Tags and View button row */}
              <div className="flex justify-between items-center mt-3">
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">#{tag}</span>
                  ))}
                </div>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-gray-400 hover:text-[#F45B26] transition-colors rounded-md hover:bg-gray-800 absolute top-3 right-3"
                    title="Open original"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
          {collectionItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">No items in this collection.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionView;
