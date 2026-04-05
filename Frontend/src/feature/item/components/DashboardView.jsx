// src/components/DashboardView.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems, deleteItem } from '../item.slice';
import { toast } from 'sonner';
import {
  Database, FolderKanban, Hash, Sparkles,
  Clock, BookOpen, ChevronRight, Lightbulb,
  TrendingUp, Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from './Loading';

const DashboardView = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];

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

    // At the top of the component, before rendering stats:
if (loading) return <Loading message="Loading your knowledge base..." />;
  // Stats (unchanged)
  const totalSaved = itemsArray.length;
  const collections = [...new Set(itemsArray.map(i => i.collection).filter(Boolean))];
  const allTags = itemsArray.flatMap(i => i.tags || []);
  const uniqueTags = [...new Set(allTags)];
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

  const resurfacedMemories = itemsArray.slice(0, 3);
  const recentSaves = itemsArray.slice(3, 6);
  const aiSuggestions = topTags.slice(0, 3).map(([tag]) => tag);

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
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your knowledge base overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Database className="w-5 h-5" />} label="Total Saved" value={totalSaved} color="text-[#F45B26]" />
        <StatCard icon={<FolderKanban className="w-5 h-5" />} label="Collections" value={collections.length} color="text-blue-400" />
        <StatCard icon={<Hash className="w-5 h-5" />} label="Tags Used" value={uniqueTags.length} color="text-green-400" />
        <StatCard icon={<Sparkles className="w-5 h-5" />} label="AI Suggestions" value={aiSuggestions.length} color="text-purple-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Resurfaced Memories */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F45B26]" />
            <h3 className="font-semibold text-white">Resurfaced Memories</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {resurfacedMemories.map((item) => (
              <MemoryCard
                key={item._id}
                item={item}
                timeAgo={getTimeAgo(item.createdAt || item.updatedAt)}
                onDelete={() => handleDelete(item._id, item.title)}
              />
            ))}
            {resurfacedMemories.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No memories yet. Start saving!</div>
            )}
          </div>
        </div>

        {/* Middle Column: Recent Saves */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#F45B26]" />
            <h3 className="font-semibold text-white">Recent Saves</h3>
          </div>
          <div className="divide-y divide-gray-800">
            {recentSaves.map(item => (
              <RecentSaveCard key={item._id} item={item} onDelete={() => handleDelete(item._id, item.title)} />
            ))}
            {recentSaves.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">No recent saves.</div>
            )}
          </div>
        </div>

        {/* Right Column: Top Tags & AI Suggestions */}
        <div className="space-y-6">
          {/* Top Tags */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#F45B26]" />
              <h3 className="font-semibold text-white">Top Tags</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {topTags.map(([tag, count]) => (
                <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-800 text-gray-300">
                  {tag} ({count})
                </span>
              ))}
              {topTags.length === 0 && <span className="text-sm text-gray-500">No tags yet</span>}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-gradient-to-r from-[#F45B26]/10 to-transparent rounded-xl border border-[#F45B26]/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-[#F45B26]" />
              <h3 className="font-semibold text-white">AI Suggestions</h3>
            </div>
            <div className="space-y-2">
              {aiSuggestions.map(suggestion => (
                <div key={suggestion} className="text-sm text-gray-300">
                  • Related to your recent saves about <span className="text-[#F45B26]">{suggestion}</span>
                </div>
              ))}
              {aiSuggestions.length === 0 && (
                <div className="text-sm text-gray-500">Add more items for personalized suggestions.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components with Delete Buttons
const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800 hover:border-[#F45B26]/30 transition-all">
    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
      {icon}
      <span>{label}</span>
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
  </div>
);

const MemoryCard = ({ item, timeAgo, onDelete }) => (
  <div className="p-4 hover:bg-gray-800/50 transition-colors group relative">
    <div className="flex justify-between items-start">
      <div className="flex-1 pr-8">
        <h4 className="font-medium text-sm text-white line-clamp-1">{item.title}</h4>
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.summary}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {item.tags?.slice(0, 2).map(t => <span key={t} className="text-xs text-[#F45B26]">#{t}</span>)}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-gray-500 whitespace-nowrap">{timeAgo}</span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const RecentSaveCard = ({ item, onDelete }) => (
  <div className="p-4 hover:bg-gray-800/50 transition-colors group relative">
    <div className="flex justify-between items-start">
      <div className="flex-1 pr-8">
        <h4 className="font-medium text-sm text-white line-clamp-1">{item.title}</h4>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span className="text-[#F45B26]">{item.collection || 'Uncategorized'}</span>
          <span>•</span>
          <span>{item.tags?.[0] || 'no tags'}</span>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default DashboardView;
