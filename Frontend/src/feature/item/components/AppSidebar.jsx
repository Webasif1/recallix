// src/feature/item/components/AppSidebar.jsx (or src/components/AppSidebar.jsx)
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/hook/useAuth';
import { useNavigate } from 'react-router';
import {
  Home,
  Search,
  Bookmark,
  FolderOpen,
  Network,
  Clock,
  LogOut,
  Plus,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Menu,
  X,
  FolderArchive
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'saved', label: 'All Saved', icon: Bookmark },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'graph', label: 'Knowledge Graph', icon: Network },
  { id: 'resurfaced', label: 'Resurfaced', icon: Clock },
];

const AppSidebar = ({ activeView, onViewChange, onQuickSave }) => {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { items } = useSelector((state) => state.items);
  const itemsArray = Array.isArray(items) ? items : [];
  const { handleLogout } = useAuth()
  const navigate = useNavigate()

  // Rest of the component remains the same...
  const collectionMap = itemsArray.reduce((acc, item) => {
    const col = item.collection;
    if (col && !acc[col]) acc[col] = { name: col, count: 0 };
    if (col) acc[col].count++;
    return acc;
  }, {});
  const collections = Object.values(collectionMap);
  const resurfacedCount = itemsArray.slice(0, 3).length;

  const handleNavigate = (view) => {
    onViewChange(view);
    setMobileOpen(false);
  };

  const handleCollectionClick = (collectionName) => {
    onViewChange(`collection-${collectionName}`);
    setMobileOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await handleLogout();

      // redirect after logout
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const sidebarContent = (
    <>
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F45B26]/15">
            <FolderArchive className="w-4 h-4 text-[#F45B26]" />
          </div>
          <span className="text-lg font-semibold text-gray-100 tracking-tight">Recallix</span>
        </div>
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 rounded-md text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-3 mb-2">
        <button onClick={onQuickSave} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#F45B26]/10 text-[#F45B26] text-sm font-medium hover:bg-[#F45B26]/20 transition-colors">
          <Plus className="w-4 h-4" />
          Quick Save
        </button>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.id === 'resurfaced' && resurfacedCount > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-[#F45B26]/20 text-[#F45B26] text-xs flex items-center justify-center font-medium">
                    {resurfacedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6">
          <button
            onClick={() => setCollectionsOpen(!collectionsOpen)}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            {collectionsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <FolderOpen className="w-3 h-3" />
            Collections
          </button>
          {collectionsOpen && (
            <div className="mt-1 space-y-0.5">
              {collections.map((col) => {
                const isColActive = activeView === `collection-${col.name}`;
                return (
                  <button
                    key={col.name}
                    onClick={() => handleCollectionClick(col.name)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${isColActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                      }`}
                  >
                    <span className="text-base">📁</span>
                    <span className="truncate flex-1 text-left">{col.name}</span>
                    <span className="text-xs text-gray-500">{col.count}</span>
                  </button>
                );
              })}
              {collections.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">No collections yet</div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F45B26]/15">
            <FolderArchive className="w-3.5 h-3.5 text-[#F45B26]" />
          </div>
          <span className="text-base font-semibold text-white">The Archive</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 h-full bg-gray-900 border-r border-gray-800 flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen bg-gray-900 border-r border-gray-800 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile FAB */}
      <button
        onClick={onQuickSave}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#F45B26] text-white flex items-center justify-center shadow-lg hover:bg-[#F45B26]/90 transition-all active:scale-95"
        style={{ boxShadow: '0 0 20px -4px rgba(244, 91, 38, 0.4)' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </>
  );
};

export default AppSidebar;
