// components/GraphView.jsx
import React from 'react';
import { Network } from 'lucide-react';

const GraphView = () => {
  return (
    <div className="max-w-7xl mx-auto text-center py-20">
      <Network className="w-16 h-16 text-[#F45B26] mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Knowledge Graph</h2>
      <p className="text-gray-400">Interactive graph visualization coming soon.</p>
      <p className="text-sm text-gray-500 mt-4">You'll be able to see connections between your saved items.</p>
    </div>
  );
};

export default GraphView;
