// src/components/GraphView.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchItems } from '../item.slice';
import { Loader2, Network } from 'lucide-react';

const GraphView = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    dispatch(fetchItems());
  }, [dispatch]);

  // Build graph data from items
  useEffect(() => {
    if (loading || itemsArray.length === 0) return;

    // Extract all unique tags as topic nodes
    const tagMap = new Map(); // tag -> count
    itemsArray.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    const topics = Array.from(tagMap.keys()).sort((a,b) => tagMap.get(b) - tagMap.get(a)).slice(0, 12); // limit to 12 topics

    // Create nodes: topics (large, colored) and items (small)
    const nodes = [];
    const edges = [];

    // Topic nodes
    topics.forEach((topic, idx) => {
      const hue = (idx * 30) % 360;
      nodes.push({
        id: `topic-${topic}`,
        label: topic,
        type: 'topic',
        radius: 24,
        color: `hsl(${hue}, 70%, 55%)`,
        vx: 0, vy: 0,
        x: 0, y: 0,
      });
    });

    // Item nodes
    itemsArray.forEach((item, idx) => {
      nodes.push({
        id: `item-${item._id}`,
        label: item.title?.length > 20 ? item.title.slice(0, 18) + '…' : item.title || 'Untitled',
        type: 'item',
        radius: 12,
        color: 'hsl(228, 12%, 20%)',
        fullTitle: item.title,
        summary: item.summary,
        collection: item.collection,
        tags: item.tags,
        vx: 0, vy: 0,
        x: 0, y: 0,
      });

      // Edges between item and its tags
      (item.tags || []).forEach(tag => {
        if (topics.includes(tag)) {
          edges.push({
            source: `item-${item._id}`,
            target: `topic-${tag}`,
          });
        }
      });
    });

    // Initial positions (radial layout)
    const w = dimensions.width || 800;
    const h = dimensions.height || 600;
    const centerX = w / 2;
    const centerY = h / 2;

    // Topics on outer ring
    topics.forEach((topic, i) => {
      const angle = (i / topics.length) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.3;
      const node = nodes.find(n => n.id === `topic-${topic}`);
      if (node) {
        node.x = centerX + Math.cos(angle) * radius;
        node.y = centerY + Math.sin(angle) * radius;
      }
    });

    // Items in inner circle
    const itemNodes = nodes.filter(n => n.type === 'item');
    itemNodes.forEach((node, i) => {
      const angle = (i / itemNodes.length) * Math.PI * 2;
      const radius = Math.min(w, h) * 0.18;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [itemsArray, loading, dimensions]);

  // Canvas setup and animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodesRef.current.length === 0) return;

    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    let width = parent.clientWidth;
    let height = parent.clientHeight;

    const resizeCanvas = () => {
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setDimensions({ width, height });

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    // Force simulation
    const animate = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Update positions
      for (const node of nodes) {
        // Center attraction
        node.vx += (width/2 - node.x) * 0.0005;
        node.vy += (height/2 - node.y) * 0.0005;

        // Repulsion between nodes
        for (const other of nodes) {
          if (node === other) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.hypot(dx, dy) || 1;
          const minDist = (node.radius + other.radius) * 2.2;
          if (dist < minDist) {
            const force = (minDist - dist) * 0.01;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }

        // Edge attraction
        for (const edge of edges) {
          let other = null;
          if (edge.source === node.id) other = nodes.find(n => n.id === edge.target);
          else if (edge.target === node.id) other = nodes.find(n => n.id === edge.source);
          if (!other) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.hypot(dx, dy) || 1;
          node.vx += (dx / dist) * 0.003;
          node.vy += (dy / dist) * 0.003;
        }

        // Damping
        node.vx *= 0.94;
        node.vy *= 0.94;
        node.x += node.vx;
        node.y += node.vy;

        // Boundaries
        node.x = Math.min(Math.max(node.x, node.radius + 10), width - node.radius - 10);
        node.y = Math.min(Math.max(node.y, node.radius + 10), height - node.radius - 10);
      }

      // Draw edges
      for (const edge of edges) {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) continue;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.strokeStyle = 'rgba(244, 91, 38, 0.15)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const isHovered = hoveredNode?.id === node.id;

        if (node.type === 'topic') {
          // Glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI*2);
          ctx.fillStyle = node.color.replace('55%', '30%');
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI*2);
          ctx.fillStyle = isHovered ? node.color : node.color.replace('55%', '45%');
          ctx.fill();

          // Label
          ctx.fillStyle = '#fff';
          ctx.font = '500 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, node.x, node.y);
        } else {
          // Item node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI*2);
          ctx.fillStyle = isHovered ? '#F45B26' : 'hsl(228, 12%, 18%)';
          ctx.fill();
          ctx.strokeStyle = isHovered ? '#F45B26' : 'hsl(228, 10%, 25%)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = 'hsl(210, 15%, 70%)';
          ctx.font = '400 9px Inter, sans-serif';
          ctx.fillText(node.label, node.x, node.y + node.radius + 6);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hoveredNode, dimensions]);

  // Mouse move detection for hover
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX / devicePixelRatio;
    const mouseY = (e.clientY - rect.top) * scaleY / devicePixelRatio;

    let closest = null;
    let minDist = 20;
    for (const node of nodesRef.current) {
      const dx = node.x - mouseX;
      const dy = node.y - mouseY;
      const dist = Math.hypot(dx, dy);
      if (dist < node.radius + 5 && dist < minDist) {
        minDist = dist;
        closest = node;
      }
    }
    setHoveredNode(closest);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-[#F45B26] animate-spin" />
        <p className="mt-4 text-gray-400">Loading graph data...</p>
      </div>
    );
  }

  if (itemsArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Network className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No items yet</h2>
        <p className="text-gray-400">Save some URLs with tags to see your knowledge graph.</p>
      </div>
    );
  }

  const topicCount = nodesRef.current.filter(n => n.type === 'topic').length;
  if (topicCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Network className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No tags found</h2>
        <p className="text-gray-400">Add tags to your saved items to create connections.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
        <p className="text-gray-400">
          {nodesRef.current.filter(n => n.type === 'item').length} items connected to {topicCount} topics
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-[600px]">
        <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredNode(null)}
          />
          <div className="absolute top-4 left-4 flex gap-4 text-xs text-gray-400 bg-gray-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary/70" />
              <span>Topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600" />
              <span>Items</span>
            </div>
          </div>
        </div>

        {/* Side panel for hovered node */}
        {hoveredNode && hoveredNode.type === 'item' && (
          <div className="w-80 bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-800 p-4 overflow-y-auto">
            <h3 className="font-semibold text-white mb-2">{hoveredNode.fullTitle || hoveredNode.label}</h3>
            <p className="text-sm text-gray-300 mb-3">{hoveredNode.summary || 'No summary available'}</p>
            <div className="mb-2">
              <span className="text-xs text-gray-400">Collection:</span>
              <p className="text-sm text-[#F45B26]">{hoveredNode.collection || 'Uncategorized'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {hoveredNode.tags?.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-300">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GraphView;
