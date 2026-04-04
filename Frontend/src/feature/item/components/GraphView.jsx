// src/components/GraphView.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems } from '../item.slice';
import ForceGraph2D from 'react-force-graph-2d';
import { Network, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const GraphView = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const fgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.max(width, 300), height: Math.max(height, 400) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Build graph data when items change
  useEffect(() => {
    if (itemsArray.length === 0) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    // Build nodes: each item becomes a node
    const nodes = itemsArray.map((item) => ({
      id: item._id,
      name: item.title,
      val: 10,
      color: getColorForCollection(item.collection),
      summary: item.summary,
      tags: item.tags || [],
      collection: item.collection,
    }));

    // Build links: connect items that share at least one tag
    const links = [];
    for (let i = 0; i < itemsArray.length; i++) {
      for (let j = i + 1; j < itemsArray.length; j++) {
        const itemA = itemsArray[i];
        const itemB = itemsArray[j];
        const commonTags = (itemA.tags || []).filter(tag => (itemB.tags || []).includes(tag));
        if (commonTags.length > 0) {
          links.push({
            source: itemA._id,
            target: itemB._id,
            value: commonTags.length,
            commonTags,
          });
        }
      }
    }

    setGraphData({ nodes, links });
  }, [itemsArray]);

  const getColorForCollection = (collection) => {
    const colors = {
      'Design': '#F45B26',
      'Tech': '#3B82F6',
      'News': '#10B981',
      'Art': '#8B5CF6',
      'Philosophy': '#EC4899',
    };
    return colors[collection] || '#6B7280';
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node);
  };

  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.2, 500);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 0.8, 500);
    }
  };

  const handleReset = () => {
    if (fgRef.current) {
      fgRef.current.zoom(1, 500);
      fgRef.current.centerAt(0, 0, 500);
    }
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#F45B26] animate-spin" />
        <p className="mt-4 text-gray-400">Building your knowledge graph...</p>
      </div>
    );
  }

  if (itemsArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Network className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No items yet</h2>
        <p className="text-gray-400">Save some URLs to see your knowledge graph.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
          <p className="text-gray-400">Visualize connections between your saved items (based on shared tags)</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleZoomIn} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition" title="Zoom In">
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <button onClick={handleZoomOut} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition" title="Zoom Out">
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <button onClick={handleReset} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition" title="Reset View">
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1 flex-col lg:flex-row">
        {/* Graph container */}
        <div ref={containerRef} className="flex-1 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden" style={{ minHeight: '500px' }}>
          {dimensions.width > 0 && dimensions.height > 0 && (
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeLabel="name"
              nodeColor={node => node.color}
              nodeVal={node => node.val}
              linkWidth={link => Math.sqrt(link.value) * 1.5}
              linkColor={() => '#F45B26'}
              linkDirectionalParticles={link => link.value}
              linkDirectionalParticleSpeed={0.005}
              onNodeClick={handleNodeClick}
              cooldownTicks={100}
              backgroundColor="#111827"
              width={dimensions.width}
              height={dimensions.height}
            />
          )}
        </div>

        {/* Side panel with node details */}
        {selectedNode && (
          <div className="lg:w-80 w-full bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-4 overflow-y-auto max-h-96 lg:max-h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white truncate">{selectedNode.name}</h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white ml-2"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-3 line-clamp-4">{selectedNode.summary || 'No summary'}</p>
            <div className="mb-3">
              <span className="text-xs text-gray-400">Collection:</span>
              <p className="text-sm text-[#F45B26]">{selectedNode.collection || 'Uncategorized'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedNode.tags?.length > 0 ? (
                  selectedNode.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">No tags</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphView;
