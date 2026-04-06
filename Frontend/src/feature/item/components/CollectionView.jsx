// src/components/CollectionView.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems, deleteItem } from '../item.slice';
import { ArrowLeft, } from 'lucide-react'; // ← added ExternalLink
import { toast } from 'sonner';
import Card from './ui/Card';

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
        <Card collectionItems={collectionItems}/>
      )}
    </div>
  );
};

export default CollectionView;
