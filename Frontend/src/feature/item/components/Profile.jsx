// src/components/Profile.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useAuth } from '../../auth/hook/useAuth';
import { User, Mail, Calendar, LogOut, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const Profile = () => {
  const navigate = useNavigate();
  const { handleLogout } = useAuth();
  const { user, loading } = useSelector((state) => state.auth);

  const onLogout = async () => {
    try {
      await handleLogout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Debug: log user object to console
  console.log('Profile user:', user);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F45B26]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <User className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-gray-400">User not found. Please log in again.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-[#F45B26] rounded-lg hover:bg-[#F45B26]/80 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Handle both id and _id, createdAt and created_at
  const userId = user.data.id || user.data._id;
  const createdAt = user.data.createdAt || user.data.created_at || user.joinedAt;
  const username = user.data.username || user.data.name;
  const email = user.data.email;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account details</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-800">
          <div className="w-20 h-20 rounded-full bg-[#F45B26]/20 flex items-center justify-center">
            <User className="w-10 h-10 text-[#F45B26]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{username}</h2>
            <p className="text-gray-400">
              Member since {createdAt ? new Date(createdAt).toLocaleDateString() : 'recently'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <Mail className="w-5 h-5 text-[#F45B26]" />
            <div>
              <p className="text-xs text-gray-400">Email Address</p>
              <p className="text-white">{email || 'Not provided'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <User className="w-5 h-5 text-[#F45B26]" />
            <div>
              <p className="text-xs text-gray-400">Username</p>
              <p className="text-white">{username}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
            <Calendar className="w-5 h-5 text-[#F45B26]" />
            <div>
              <p className="text-xs text-gray-400">User ID</p>
              <p className="text-white text-sm font-mono">{userId}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
          >
            Back to Dashboard
          </button>
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
