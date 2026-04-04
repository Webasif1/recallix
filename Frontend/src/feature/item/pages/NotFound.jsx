// src/components/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated SVG Illustration */}
        <div className="mb-8 flex justify-center">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            {/* Floating document background */}
            <g className="animate-float">
              <rect
                x="65"
                y="75"
                width="80"
                height="100"
                rx="6"
                fill="#1f1f1f"
                stroke="#F45B26"
                strokeWidth="2"
              />
              <line x1="80" y1="95" x2="130" y2="95" stroke="#F45B26" strokeWidth="2" strokeLinecap="round" />
              <line x1="80" y1="110" x2="125" y2="110" stroke="#F45B26" strokeWidth="2" strokeLinecap="round" />
              <line x1="80" y1="125" x2="120" y2="125" stroke="#F45B26" strokeWidth="2" strokeLinecap="round" />
              <line x1="80" y1="140" x2="110" y2="140" stroke="#F45B26" strokeWidth="2" strokeLinecap="round" />
              {/* Question mark on document */}
              <text x="105" y="168" textAnchor="middle" fill="#F45B26" fontSize="22" fontWeight="bold">?</text>
            </g>

            {/* Magnifying glass (searching) */}
            <g className="animate-pulse-slow">
              <circle cx="135" cy="55" r="22" stroke="#F45B26" strokeWidth="3" fill="none" />
              <line x1="150" y1="70" x2="170" y2="90" stroke="#F45B26" strokeWidth="3" strokeLinecap="round" />
              {/* Sparkle */}
              <path
                d="M120 45 L125 50 L120 55 L115 50 Z"
                fill="#F45B26"
                className="animate-ping"
                style={{ animationDuration: '1.5s' }}
              />
            </g>

            {/* Small floating particles */}
            <circle cx="50" cy="140" r="3" fill="#F45B26" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="160" cy="150" r="2" fill="#F45B26" className="animate-pulse" style={{ animationDelay: '1s' }} />
            <circle cx="40" cy="60" r="2" fill="#F45B26" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
          </svg>
        </div>

        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-2">Lost in the Archive</h2>
        <p className="text-gray-400 mb-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Maybe it was never archived, or the link is broken.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F45B26] hover:bg-[#F45B26]/80 rounded-lg font-medium transition-all shadow-lg shadow-[#F45B26]/20"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-all"
          >
            <Search className="w-4 h-4" />
            Homepage
          </Link>
        </div>
      </div>

      {/* Add custom keyframes for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
