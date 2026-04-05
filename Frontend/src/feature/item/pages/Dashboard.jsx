// src/feature/item/pages/Dashboard.jsx
import { useState } from 'react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { addItem } from '../item.slice';
import AppSidebar from '../components/AppSidebar';
import DashboardView from '../components/DashboardView';
import AllSavedView from '../components/AllSavedView';
import GraphView from '../components/GraphView';
import SearchView from '../components/SearchView';
import ResurfacedView from '../components/ResurfacedView';
import CollectionView from '../components/CollectionView';
import QuickSaveModal from '../components/QuickSaveModal';
import Profile from '../components/Profile';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState('dashboard');
  const [quickSaveOpen, setQuickSaveOpen] = useState(false);

  const handleSave = async (data) => {
    try {
      await dispatch(addItem(data.url)).unwrap();
      toast.success('Saved!', { description: data.title || data.url });
      setQuickSaveOpen(false);
    } catch (error) {
      toast.error('Failed to save', { description: error.message });
    }
  };

  const renderView = () => {
    if (activeView.startsWith('collection-')) {
      const collectionName = activeView.replace('collection-', '');
      return <CollectionView collectionName={collectionName} onBack={() => setActiveView('dashboard')} />;
    }
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'saved': return <AllSavedView />;
      case 'search': return <SearchView />;
      case 'graph': return <GraphView />;
      case 'resurfaced': return <ResurfacedView />;
      case 'profile': return <Profile />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onQuickSave={() => setQuickSaveOpen(true)}
      />
      <main className="flex-1 overflow-y-auto p-4 pt-16 md:pt-6 md:p-6 lg:p-8">
        {renderView()}
      </main>
      <QuickSaveModal
        open={quickSaveOpen}
        onClose={() => setQuickSaveOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Dashboard;
