import React from 'react';
import {
  BookOpen,
  LogIn,
  UserPlus,
  ArrowRight,
  Save,
  Tag,
  Share2,
  Sparkles,
  FolderArchive,
  Globe,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F45B26]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F45B26]/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-4xl bg-[#F45B26]/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[#F45B26] to-[#F45B26]/80 rounded-xl shadow-lg shadow-[#F45B26]/20">
                <FolderArchive className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#F45B26] to-[#F45B26]/70 bg-clip-text text-transparent">
                Recallix
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 px-4 py-2 bg-[#F45B26] hover:bg-[#F45B26]/80 rounded-lg text-sm font-medium transition-all shadow-lg shadow-[#F45B26]/20"
              >
                <UserPlus className="w-4 h-4" />
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Save everything,
            <span className="block text-[#F45B26]">Forget nothing</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            Recallix automatically organizes, connects, and resurfaces your saved content —
            so the right knowledge finds you at the right time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#F45B26] hover:bg-[#F45B26]/80 rounded-lg font-semibold transition-all shadow-lg shadow-[#F45B26]/25 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to build your knowledge base
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            From saving to discovering, Recallix handles the heavy lifting.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Save Anything */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-[#F45B26]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F45B26]/20 transition-colors">
              <Save className="w-6 h-6 text-[#F45B26]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Save Anything</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Articles, tweets, videos, PDFs — save from anywhere on the internet. One click and it's in your archive.
            </p>
          </div>

          {/* AI Auto-Tagging */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-[#F45B26]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F45B26]/20 transition-colors">
              <Tag className="w-6 h-6 text-[#F45B26]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Auto-Tagging</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automatic tag suggestions and topic clustering for your saved items. Never lose a thought again.
            </p>
          </div>

          {/* Knowledge Graph */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 hover:border-[#F45B26]/30 transition-all duration-300 group">
            <div className="w-12 h-12 bg-[#F45B26]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#F45B26]/20 transition-colors">
              <Share2 className="w-6 h-6 text-[#F45B26]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Knowledge Graph</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Visualize connections between your saved items in an interactive graph. Discover relationships you never knew existed.
            </p>
          </div>
        </div>
      </section>

      {/* Optional: Show how it works or a CTA banner */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-gradient-to-r from-[#F45B26]/10 via-[#F45B26]/5 to-transparent rounded-2xl p-8 border border-[#F45B26]/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">Ready to stop forgetting?</h3>
              <p className="text-gray-300">Join thousands of curators building their second brain.</p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F45B26] hover:bg-[#F45B26]/80 rounded-lg font-semibold transition-all shadow-lg shadow-[#F45B26]/20 whitespace-nowrap"
            >
              Start curating for free
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              <span>Powered by GPT-4 • Auto-tagging active</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition">About</a>
              <a href="#" className="hover:text-gray-300 transition">Privacy</a>
              <a href="#" className="hover:text-gray-300 transition">Terms</a>
            </div>
            <div>© 2025 Recallix. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
