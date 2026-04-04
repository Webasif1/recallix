// components/SearchView.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems } from '../item.slice';
import { Search } from 'lucide-react';

const SearchView = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
    } else {
      const term = query.toLowerCase();
      setResults(itemsArray.filter(item =>
        item.title?.toLowerCase().includes(term) ||
        item.summary?.toLowerCase().includes(term) ||
        item.tags?.some(t => t.toLowerCase().includes(term)) ||
        item.collection?.toLowerCase().includes(term)
      ));
    }
  }, [query, itemsArray]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-gray-400 mt-1">Find anything in your knowledge base</p>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, summary, tags, or collection..."
          className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F45B26]"
          autoFocus
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F45B26]"></div></div>
      ) : (
        <div className="space-y-4">
          {results.map(item => (
            <div key={item._id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-xs text-[#F45B26] mt-1 uppercase">{item.collection || 'Uncategorized'}</p>
              <p className="text-sm text-gray-300 mt-2 line-clamp-2">{item.summary}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {item.tags?.map(tag => <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">#{tag}</span>)}
              </div>
            </div>
          ))}
          {query && results.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-400">No results found for "{query}"</div>
          )}
          {!query && <div className="text-center py-12 text-gray-400">Enter a search term to find items</div>}
        </div>
      )}
    </div>
  );
};

export default SearchView;
